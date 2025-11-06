#!/usr/bin/env python3
"""
Visualize Context Bench benchmark statistics
"""
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# Set clean white theme style
plt.style.use('default')
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10
plt.rcParams['figure.facecolor'] = '#ffffff'
plt.rcParams['axes.facecolor'] = '#ffffff'
plt.rcParams['axes.edgecolor'] = '#333333'
plt.rcParams['grid.color'] = '#cccccc'
plt.rcParams['text.color'] = '#000000'
plt.rcParams['axes.labelcolor'] = '#000000'
plt.rcParams['xtick.color'] = '#000000'
plt.rcParams['ytick.color'] = '#000000'

# Data from README
servers = ['Deepcon', 'Context7', 'NIA', 'Exa', 'Baseline']
scenarios_passed = [18, 13, 11, 5, 0]
total_scenarios = 20

# Token usage data (excluding baseline)
server_tokens = ['Context7', 'Exa', 'Deepcon', 'NIA']
avg_tokens = [5626, 4753, 2365, 1873]
total_tokens = [112515, 95065, 47290, 37457]

# Calculate accuracy percentages
accuracy_pct = [(passed / total_scenarios) * 100 for passed in scenarios_passed]

# Create output directory
output_dir = Path('visualizations')
output_dir.mkdir(exist_ok=True)

# Clean professional color palette
colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#6b7280']  # Professional colors

# ============================================================================
# Chart 1: Accuracy Comparison (Scenarios Passed)
# ============================================================================
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

bars = ax.barh(servers, scenarios_passed, color=colors, edgecolor='#333333', linewidth=1.2, alpha=0.85)

# Add value labels on bars
for i, (bar, pct) in enumerate(zip(bars, accuracy_pct)):
    width = bar.get_width()
    ax.text(width + 0.3, bar.get_y() + bar.get_height()/2,
            f'{int(width)}/20 ({pct:.0f}%)',
            ha='left', va='center', fontweight='bold', fontsize=11,
            color='#000000')

ax.set_xlabel('Scenarios Passed (out of 20)', fontsize=12, fontweight='bold')
ax.set_title('MCP Server Accuracy Comparison\nAI Framework Integration Scenarios',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xlim(0, 22)
ax.grid(axis='x', alpha=0.3, linewidth=0.8)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#333333')
ax.spines['bottom'].set_color('#333333')

plt.tight_layout()
plt.savefig(output_dir / 'accuracy_comparison.png', dpi=300, bbox_inches='tight', facecolor='#ffffff')
print(f"✓ Generated: {output_dir / 'accuracy_comparison.png'}")

# ============================================================================
# Chart 2: Token Usage Comparison
# ============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_facecolor('#ffffff')

# Average tokens per scenario
colors_tokens = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6']
ax1.set_facecolor('#ffffff')
bars1 = ax1.barh(server_tokens, avg_tokens, color=colors_tokens, edgecolor='#333333', linewidth=1.2, alpha=0.85)

for bar in bars1:
    width = bar.get_width()
    ax1.text(width + 100, bar.get_y() + bar.get_height()/2,
            f'{int(width):,}',
            ha='left', va='center', fontweight='bold', fontsize=10)

ax1.set_xlabel('Average Tokens per Scenario', fontsize=11, fontweight='bold')
ax1.set_title('Average Token Usage', fontsize=12, fontweight='bold')
ax1.grid(axis='x', alpha=0.3, linewidth=0.8)
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)
ax1.spines['left'].set_color('#333333')
ax1.spines['bottom'].set_color('#333333')

# Total tokens
ax2.set_facecolor('#ffffff')
bars2 = ax2.barh(server_tokens, total_tokens, color=colors_tokens, edgecolor='#333333', linewidth=1.2, alpha=0.85)

for bar in bars2:
    width = bar.get_width()
    ax2.text(width + 2000, bar.get_y() + bar.get_height()/2,
            f'{int(width):,}',
            ha='left', va='center', fontweight='bold', fontsize=10)

ax2.set_xlabel('Total Tokens (20 scenarios)', fontsize=11, fontweight='bold')
ax2.set_title('Total Token Usage', fontsize=12, fontweight='bold')
ax2.grid(axis='x', alpha=0.3, linewidth=0.8)
ax2.spines['top'].set_visible(False)
ax2.spines['right'].set_visible(False)
ax2.spines['left'].set_color('#333333')
ax2.spines['bottom'].set_color('#333333')

plt.tight_layout()
plt.savefig(output_dir / 'token_usage_comparison.png', dpi=300, bbox_inches='tight', facecolor='#ffffff')
print(f"✓ Generated: {output_dir / 'token_usage_comparison.png'}")

# ============================================================================
# Chart 3: Efficiency Chart (Accuracy vs Token Usage)
# ============================================================================
fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

# Map data for scatter plot (excluding baseline)
server_efficiency = {
    'Deepcon': {'passed': 18, 'avg_tokens': 2365},
    'Context7': {'passed': 13, 'avg_tokens': 5626},
    'NIA': {'passed': 11, 'avg_tokens': 1873},
    'Exa': {'passed': 5, 'avg_tokens': 4753}
}

colors_scatter = {'Deepcon': '#10b981', 'Context7': '#3b82f6',
                  'NIA': '#8b5cf6', 'Exa': '#ef4444'}
sizes = [400, 300, 300, 300]

for i, (server, data) in enumerate(server_efficiency.items()):
    ax.scatter(data['avg_tokens'], data['passed'],
              s=sizes[i], alpha=0.75, color=colors_scatter[server],
              edgecolors='#333333', linewidth=2, label=server)

    # Add labels
    ax.annotate(server,
               xy=(data['avg_tokens'], data['passed']),
               xytext=(10, 10), textcoords='offset points',
               fontsize=11, fontweight='bold',
               bbox=dict(boxstyle='round,pad=0.5', facecolor=colors_scatter[server],
                        alpha=0.3, edgecolor='#333333', linewidth=1.2))

# Add quadrant lines
ax.axhline(y=10, color='#999999', linestyle='--', alpha=0.5, linewidth=1.5)
ax.axvline(x=3500, color='#999999', linestyle='--', alpha=0.5, linewidth=1.5)

# Annotate quadrants
ax.text(5500, 17, 'High Accuracy\nHigh Tokens',
        fontsize=9, alpha=0.6, ha='center', style='italic', color='#666666')
ax.text(2000, 17, 'High Accuracy\nLow Tokens\n(IDEAL)',
        fontsize=9, alpha=0.8, ha='center', style='italic', fontweight='bold', color='#10b981')
ax.text(5500, 7, 'Low Accuracy\nHigh Tokens',
        fontsize=9, alpha=0.6, ha='center', style='italic', color='#666666')
ax.text(2000, 7, 'Low Accuracy\nLow Tokens',
        fontsize=9, alpha=0.6, ha='center', style='italic', color='#666666')

ax.set_xlabel('Average Tokens per Scenario', fontsize=12, fontweight='bold')
ax.set_ylabel('Scenarios Passed (out of 20)', fontsize=12, fontweight='bold')
ax.set_title('MCP Server Efficiency: Accuracy vs Token Usage\n(Top-left corner = ideal)',
             fontsize=14, fontweight='bold', pad=20)
ax.set_ylim(0, 20)
ax.set_xlim(1000, 6500)
ax.grid(True, alpha=0.25, linewidth=0.8)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#333333')
ax.spines['bottom'].set_color('#333333')

legend = ax.legend(loc='lower right', fontsize=11, framealpha=0.95, facecolor='#ffffff', edgecolor='#cccccc')

plt.tight_layout()
plt.savefig(output_dir / 'efficiency_scatter.png', dpi=300, bbox_inches='tight', facecolor='#ffffff')
print(f"✓ Generated: {output_dir / 'efficiency_scatter.png'}")

print("\n" + "="*60)
print("All visualizations generated successfully!")
print("="*60)
print(f"\nOutput directory: {output_dir.absolute()}")
print("\nGenerated files:")
print("  1. accuracy_comparison.png - Horizontal bar chart of scenarios passed")
print("  2. token_usage_comparison.png - Token usage metrics")
print("  3. efficiency_scatter.png - Accuracy vs token efficiency")
