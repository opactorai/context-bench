/**
 * Evaluator - Evaluate oneshot/agent results against oracle using OpenRouter
 */

import OpenAI from 'openai';
import { ScenarioSpec, ExecutionMode } from './types.js';
import { Logger } from './logger.js';
import path from 'path';
import fs from 'fs-extra';

export interface SingleModelEvaluation {
  model: string;
  completeness: boolean;
  relevance: boolean;
  overall_score: 1 | 2 | 3 | 4 | 5;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface EvaluationResult {
  mode: ExecutionMode;
  models: SingleModelEvaluation[];
  aggregated: {
    completeness_rate: number; // 0-1 (percentage of models that said true)
    relevance_rate: number; // 0-1 (percentage of models that said true)
    average_score: number; // 1-5 (average of all model scores)
    final_score: 1 | 2 | 3 | 4 | 5; // Rounded average
    // Majority vote results (2 out of 3 = true)
    completeness_majority: boolean; // true if >= 2 models say true
    relevance_majority: boolean; // true if >= 2 models say true
    pass: boolean; // true only if both completeness_majority AND relevance_majority are true
  };
  consensus: boolean; // true if all models agree on completeness and relevance
}

/**
 * Default evaluation models to use
 */
const DEFAULT_EVALUATION_MODELS = [
  'openai/gpt-5',
  'deepseek/deepseek-v3.2-exp',
  'x-ai/grok-4'
];

/**
 * Evaluate result markdown against oracle using multiple models
 */
export async function evaluateResult(
  scenario: ScenarioSpec,
  mode: ExecutionMode,
  workspaceDir: string,
  logger: Logger,
  models: string[] = DEFAULT_EVALUATION_MODELS
): Promise<EvaluationResult> {
  logger.marker(`>>>>> Evaluating ${mode} mode result with ${models.length} models`);

  // Verify API key
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable not set');
  }

  try {
    // Read result markdown based on mode
    let resultMd = '';
    if (mode === 'oneshot') {
      const resultPath = path.join(workspaceDir, 'oneshot_result.md');
      if (await fs.pathExists(resultPath)) {
        resultMd = await fs.readFile(resultPath, 'utf-8');
        logger.info(`Read oneshot result: ${resultPath}`);
      } else {
        logger.warn(`Oneshot result not found: ${resultPath}`);
      }
    } else {
      // Agent mode: use MCP results summary
      const summaryPath = path.join(workspaceDir, 'mcp_results', 'summary.md');
      if (await fs.pathExists(summaryPath)) {
        resultMd = await fs.readFile(summaryPath, 'utf-8');
        logger.info(`Read agent MCP summary: ${summaryPath}`);
      } else {
        logger.warn(`Agent MCP summary not found: ${summaryPath}`);
      }

      // Also include implementation code
      const logicPath = path.join(workspaceDir, 'app', 'logic.ts');
      if (await fs.pathExists(logicPath)) {
        const logicCode = await fs.readFile(logicPath, 'utf-8');
        resultMd += `\n\n---\n\n## Implementation Code\n\n\`\`\`typescript\n${logicCode}\n\`\`\`\n`;
        logger.info(`Read implementation code: ${logicPath}`);
      }
    }

    if (!resultMd) {
      throw new Error(`No result found for ${mode} mode in ${workspaceDir}`);
    }

    // Read oracle
    let oracleContent = '';
    if (scenario.validation?.oracle) {
      // Oracle path in yaml already includes 'scenarios/' prefix
      // e.g., "scenarios/autogen/streaming_tools.py"
      const oraclePath = scenario.validation.oracle;
      if (await fs.pathExists(oraclePath)) {
        oracleContent = await fs.readFile(oraclePath, 'utf-8');
        logger.info(`Read oracle: ${oraclePath}`);
      } else {
        logger.warn(`Oracle not found: ${oraclePath}`);
      }
    }

    // If no oracle, use validation criteria
    if (!oracleContent && scenario.validation?.validation_criteria) {
      oracleContent = scenario.validation.validation_criteria.join('\n');
      logger.info(`Using validation criteria as oracle`);
    }

    // Create evaluation prompt
    const evaluationPrompt = buildEvaluationPrompt(
      scenario,
      mode,
      resultMd,
      oracleContent
    );

    // Initialize OpenRouter client
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://context-bench',
        'X-Title': 'Context Code Benchmark Evaluator',
      }
    });

    // Define evaluation schema for structured output
    const evaluationSchema = {
      type: "object",
      properties: {
        completeness: {
          type: "boolean",
          description: "True if the implementation covers all required aspects and effectively uses MCP context from documentation/code search. False otherwise."
        },
        relevance: {
          type: "boolean",
          description: "True if the implementation is relevant to the scenario query and matches the oracle code structure and functionality. False otherwise."
        },
        overall_score: {
          type: "integer",
          enum: [1, 2, 3, 4, 5],
          description: "Overall quality score: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent"
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level in this evaluation: high=very confident in the assessment, medium=moderately confident, low=uncertain or limited information"
        },
        reasoning: {
          type: "string",
          description: "Detailed explanation of the evaluation, including what was done well and what could be improved"
        }
      },
      required: ["completeness", "relevance", "overall_score", "confidence", "reasoning"],
      additionalProperties: false
    };

    const systemPrompt = `You are an expert evaluator for MCP context quality assessment. 
Your task is to evaluate whether the MCP context retrieved contains sufficient information to implement the oracle code.

**Evaluation Focus**: Can a developer implement functionality equivalent to the oracle code based on the MCP context only?

**IMPORTANT: Evaluation Process (Follow in Order)**:

**Step 1: Analyze User Requirements**
- Extract ALL specific requirements from the user's query
- Identify explicit constraints (specific APIs, models, versions, features)

**Step 2: Analyze Oracle Implementation**
- What APIs/functions does the oracle use?
- What parameters and return types are used?

**Step 3: Evaluate MCP Context Completeness**
For EACH requirement identified in Step 1, check if the MCP context provides:
1. **API/Function signatures**: Are the necessary functions documented?
2. **Parameters**: Can parameter types, names, and purposes be inferred from examples?
3. **Return values**: Can return types and structures be inferred from examples?
4. **Usage patterns**: Are there examples showing how to use the APIs?

**Step 4: Make Completeness Decision**
- **COMPLETE (true)** = For ALL user requirements, the MCP context provides enough information to infer API signatures, parameters, return types, and usage
- **INCOMPLETE (false)** = ANY critical information is missing or cannot be reliably inferred from context

**Key Rules**:
1. **Explicit constraints must be met**:
   - User says "use GPT-4" + context only has GPT-3 → INCOMPLETE
   - User says "implement search" + context has different search API → COMPLETE (if parameters/returns are inferable)

2. **All information must be inferable from context**:
   - Parameter types must be clear from examples or documentation
   - Return value structures must be inferable
   - If you have to guess without evidence → INCOMPLETE

3. **Partial implementation = INCOMPLETE**:
   - If only 80% of requirements can be met → INCOMPLETE
   - All user requirements must be addressable

Evaluation criteria:
- **Completeness (boolean)**:
  - True = For ALL user requirements, you can infer: (1) which APIs/functions to call, (2) what parameters to pass and their types, (3) what the return values look like, (4) how to handle errors
  - False = ANY critical information cannot be reliably inferred, OR user's explicit requirements are not addressed, OR you would have to guess without evidence

- **Relevance (boolean)**:
  - True = The MCP context directly addresses the user's requirements and oracle's functionality
  - False = The MCP context is off-topic or doesn't help implement the required functionality

- **Overall Score (1-5)**:
  - 5 = Excellent: All information clearly inferable; can confidently implement all requirements
  - 4 = Good: Most information inferable; minor gaps that don't block implementation
  - 3 = Average: Some key information inferable but significant gaps exist
  - 2 = Below Average: Many critical details missing; cannot reliably implement
  - 1 = Poor: Context is insufficient; cannot determine how to implement

- **Confidence (high/medium/low)**:
  - high = Very confident based on clear evidence in the context
  - medium = Moderately confident, some aspects require interpretation
  - low = Uncertain due to ambiguity or missing information`;

    // Call all models in parallel with retry
    logger.info(`Calling OpenRouter API with ${models.length} models in parallel...`);

    const evaluationPromises = models.map(async (model) => {
      const MAX_RETRIES = 5;
      let lastError: any;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          logger.info(`  - Calling ${model} (attempt ${attempt}/${MAX_RETRIES})...`);

          const response = await openai.chat.completions.create({
            model: model,
            temperature: 0,
            max_tokens: 8192,
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "evaluation_result",
                strict: true,
                schema: evaluationSchema
              }
            },
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: evaluationPrompt
              }
            ]
          } as any);

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error(`No content in response from ${model}`);
          }

          const evaluation = JSON.parse(content);

          logger.info(`  ✓ ${model}: score=${evaluation.overall_score}, completeness=${evaluation.completeness}, relevance=${evaluation.relevance}, confidence=${evaluation.confidence}`);

          return {
            model,
            completeness: evaluation.completeness,
            relevance: evaluation.relevance,
            overall_score: evaluation.overall_score,
            confidence: evaluation.confidence,
            reasoning: evaluation.reasoning
          } as SingleModelEvaluation;

        } catch (error: any) {
          lastError = error;
          logger.warn(`  ⚠ ${model} attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

          if (attempt < MAX_RETRIES) {
            // Exponential backoff: 1s, 2s, 4s, 8s
            const delay = Math.pow(2, attempt - 1) * 1000;
            logger.info(`  ⏳ Retrying ${model} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      logger.error(`  ✗ ${model} failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
      throw lastError;
    });

    // Wait for all evaluations to complete
    const modelEvaluations = await Promise.all(evaluationPromises);

    logger.marker('>>>>> All Model Evaluations Complete');

    // Aggregate results
    const completenessCount = modelEvaluations.filter(e => e.completeness).length;
    const relevanceCount = modelEvaluations.filter(e => e.relevance).length;
    const averageScore = modelEvaluations.reduce((sum, e) => sum + e.overall_score, 0) / modelEvaluations.length;
    const finalScore = Math.round(averageScore) as 1 | 2 | 3 | 4 | 5;

    // Majority vote: 2 out of 3 = true
    const completenessMajority = completenessCount >= 2;
    const relevanceMajority = relevanceCount >= 2;

    // Pass only if both completeness AND relevance pass majority vote
    const pass = completenessMajority && relevanceMajority;

    // Check consensus (all models agree on completeness and relevance)
    const allCompleteness = modelEvaluations.every(e => e.completeness);
    const allRelevance = modelEvaluations.every(e => e.relevance);
    const noneCompleteness = modelEvaluations.every(e => !e.completeness);
    const noneRelevance = modelEvaluations.every(e => !e.relevance);
    const consensus = (allCompleteness || noneCompleteness) && (allRelevance || noneRelevance);

    const aggregated = {
      completeness_rate: completenessCount / modelEvaluations.length,
      relevance_rate: relevanceCount / modelEvaluations.length,
      average_score: averageScore,
      final_score: finalScore,
      completeness_majority: completenessMajority,
      relevance_majority: relevanceMajority,
      pass: pass
    };

    logger.info('='.repeat(80));
    logger.info('Aggregated Results:');
    logger.info(`  Final Score: ${finalScore}/5 (avg: ${averageScore.toFixed(2)})`);
    logger.info(`  Completeness: ${completenessCount}/${modelEvaluations.length} → Majority: ${completenessMajority ? 'PASS ✓' : 'FAIL ✗'}`);
    logger.info(`  Relevance: ${relevanceCount}/${modelEvaluations.length} → Majority: ${relevanceMajority ? 'PASS ✓' : 'FAIL ✗'}`);
    logger.info(`  Overall: ${pass ? 'PASS ✓' : 'FAIL ✗'} (Both must pass)`);
    logger.info(`  Consensus: ${consensus ? 'YES' : 'NO'}`);
    logger.info('='.repeat(80));

    // Save evaluation result
    const evalPath = path.join(workspaceDir, `evaluation_${mode}.json`);
    await fs.writeJson(evalPath, {
      scenario: scenario.id,
      mode,
      timestamp: new Date().toISOString(),
      models: modelEvaluations,
      aggregated,
      consensus
    }, { spaces: 2 });
    logger.info(`Evaluation saved to ${evalPath}`);

    return {
      mode,
      models: modelEvaluations,
      aggregated,
      consensus
    };

  } catch (error: any) {
    logger.marker('>>>>> Evaluation Failed');
    logger.error(`Error: ${error.message}`);
    logger.error(error.stack || '');
    throw error;
  }
}

/**
 * Build evaluation prompt
 */
function buildEvaluationPrompt(
  scenario: ScenarioSpec,
  mode: ExecutionMode,
  resultMd: string,
  oracleContent: string
): string {
  let prompt = `# MCP Context Evaluation Task\n\n`;
  prompt += `**Scenario**: ${scenario.id}\n`;
  prompt += `**Mode**: ${mode}\n`;
  prompt += `**Task**: Evaluate whether the MCP context contains sufficient information to implement the oracle code\n\n`;
  prompt += `---\n\n`;

  prompt += `## Original Query\n\n${scenario.agent_prompt}\n\n`;
  prompt += `---\n\n`;

  prompt += `## MCP Context Retrieved\n\n${resultMd}\n\n`;
  prompt += `---\n\n`;

  if (oracleContent) {
    prompt += `## Oracle Code (Target Implementation)\n\n`;
    if (oracleContent.includes('```')) {
      prompt += oracleContent + '\n\n';
    } else {
      prompt += `\`\`\`\n${oracleContent}\n\`\`\`\n\n`;
    }
    prompt += `---\n\n`;
  }

  prompt += `## Evaluation Task\n\n`;
  prompt += `Follow these steps systematically:\n\n`;

  prompt += `### Step 1: Analyze User Requirements\n`;
  prompt += `From the user's query, extract:\n`;
  prompt += `- What functionality is requested?\n`;
  prompt += `- Are there explicit constraints? (specific APIs, models, versions, features)\n`;
  prompt += `- What technical specifications are mentioned?\n\n`;

  prompt += `### Step 2: Analyze Oracle Implementation\n`;
  prompt += `From the oracle code:\n`;
  prompt += `- What APIs/functions does it use?\n`;
  prompt += `- What are the parameter types and return types?\n`;
  prompt += `- What error handling or patterns are used?\n\n`;

  prompt += `### Step 3: Evaluate MCP Context Coverage\n`;
  prompt += `For EACH user requirement, check if the MCP context allows you to infer:\n\n`;
  prompt += `**Required Information Checklist** (Must be inferable for Complete = true):\n`;
  prompt += `1. ✓ **API/Function names**: Which functions to call?\n`;
  prompt += `2. ✓ **Parameter types**: What type of data each parameter expects?\n`;
  prompt += `3. ✓ **Parameter names/purposes**: What each parameter does?\n`;
  prompt += `4. ✓ **Return value structure**: What the function returns?\n`;
  prompt += `5. ✓ **Usage patterns**: How to call and use the APIs?\n`;
  prompt += `6. ✓ **Error handling**: How errors work?\n\n`;

  prompt += `**Critical Rules**:\n`;
  prompt += `- If user specifies "use GPT-4" → context MUST have GPT-4 info\n`;
  prompt += `- If user says "implement search" → any search API is OK if parameters/returns are clear\n`;
  prompt += `- If you have to GUESS any critical info → mark as INCOMPLETE\n`;
  prompt += `- Partial implementation possible → mark as INCOMPLETE\n\n`;

  prompt += `### Step 4: Make Your Decision\n\n`;
  prompt += `**Completeness = true** if:\n`;
  prompt += `- ALL user requirements are addressable\n`;
  prompt += `- ALL 6 items in the checklist can be inferred for each requirement\n`;
  prompt += `- No guessing required\n\n`;

  prompt += `**Completeness = false** if:\n`;
  prompt += `- ANY requirement cannot be fully addressed\n`;
  prompt += `- ANY critical information (params, returns, usage) is unclear\n`;
  prompt += `- User's explicit constraints not met\n\n`;

  prompt += `---\n\n`;

  prompt += `Your reasoning MUST include:\n`;
  prompt += `1. List of user requirements\n`;
  prompt += `2. Oracle's implementation details\n`;
  prompt += `3. For each requirement: what information is in the context and what can be inferred\n`;
  prompt += `4. Clear decision: Complete or Incomplete and why\n`;
  prompt += `5. Quote specific examples from context as evidence`;

  return prompt;
}

/**
 * Compare oneshot and agent results
 */
export async function compareResults(
  oneshotEval: EvaluationResult,
  agentEval: EvaluationResult,
  logger: Logger
): Promise<{
  winner: ExecutionMode | 'tie';
  score_diff: number;
  comparison: string;
}> {
  logger.marker('>>>>> Comparing Oneshot vs Agent');

  const scoreDiff = agentEval.aggregated.final_score - oneshotEval.aggregated.final_score;

  logger.info(`Oneshot Score: ${oneshotEval.aggregated.final_score}/5`);
  logger.info(`Agent Score: ${agentEval.aggregated.final_score}/5`);
  logger.info(`Difference: ${scoreDiff > 0 ? '+' : ''}${scoreDiff}`);

  let comparison = `# Oneshot vs Agent Comparison\n\n`;
  comparison += `## Aggregated Scores\n\n`;
  comparison += `| Metric | Oneshot | Agent | Diff |\n`;
  comparison += `|--------|---------|-------|------|\n`;
  comparison += `| **Result** | **${oneshotEval.aggregated.pass ? 'PASS ✓' : 'FAIL ✗'}** | **${agentEval.aggregated.pass ? 'PASS ✓' : 'FAIL ✗'}** | - |\n`;
  comparison += `| Final Score | ${oneshotEval.aggregated.final_score}/5 | ${agentEval.aggregated.final_score}/5 | ${scoreDiff > 0 ? '+' : ''}${scoreDiff} |\n`;
  comparison += `| Avg Score | ${oneshotEval.aggregated.average_score.toFixed(2)} | ${agentEval.aggregated.average_score.toFixed(2)} | ${(agentEval.aggregated.average_score - oneshotEval.aggregated.average_score).toFixed(2)} |\n`;
  comparison += `| Completeness (Majority) | ${oneshotEval.aggregated.completeness_majority ? 'PASS ✓' : 'FAIL ✗'} | ${agentEval.aggregated.completeness_majority ? 'PASS ✓' : 'FAIL ✗'} | - |\n`;
  comparison += `| Relevance (Majority) | ${oneshotEval.aggregated.relevance_majority ? 'PASS ✓' : 'FAIL ✗'} | ${agentEval.aggregated.relevance_majority ? 'PASS ✓' : 'FAIL ✗'} | - |\n`;
  comparison += `| Consensus | ${oneshotEval.consensus ? 'YES' : 'NO'} | ${agentEval.consensus ? 'YES' : 'NO'} | - |\n`;
  comparison += `\n`;

  comparison += `## Individual Model Scores\n\n`;
  comparison += `### Oneshot\n\n`;
  oneshotEval.models.forEach((m) => {
    comparison += `- **${m.model}**: Score ${m.overall_score}/5, Completeness: ${m.completeness ? '✓' : '✗'}, Relevance: ${m.relevance ? '✓' : '✗'}, Confidence: ${m.confidence}\n`;
  });
  comparison += `\n### Agent\n\n`;
  agentEval.models.forEach((m) => {
    comparison += `- **${m.model}**: Score ${m.overall_score}/5, Completeness: ${m.completeness ? '✓' : '✗'}, Relevance: ${m.relevance ? '✓' : '✗'}, Confidence: ${m.confidence}\n`;
  });
  comparison += `\n`;

  comparison += `## Winner\n\n`;
  const winner: ExecutionMode | 'tie' = scoreDiff > 0 ? 'agent' : (scoreDiff < 0 ? 'oneshot' : 'tie');
  if (winner === 'tie') {
    comparison += `**TIE** - Both modes achieved the same score (${agentEval.aggregated.final_score}/5)\n\n`;
  } else {
    comparison += `**${winner.toUpperCase()}** mode performed better (${Math.abs(scoreDiff)} point${Math.abs(scoreDiff) > 1 ? 's' : ''} higher)\n\n`;
  }

  comparison += `## Reasoning from Models\n\n`;
  comparison += `### Oneshot\n\n`;
  oneshotEval.models.forEach((m) => {
    comparison += `#### ${m.model}\n${m.reasoning}\n\n`;
  });
  comparison += `### Agent\n\n`;
  agentEval.models.forEach((m) => {
    comparison += `#### ${m.model}\n${m.reasoning}\n\n`;
  });

  logger.marker(`>>>>> Winner: ${winner.toUpperCase()}`);

  return {
    winner: winner as ExecutionMode,
    score_diff: scoreDiff,
    comparison,
  };
}
