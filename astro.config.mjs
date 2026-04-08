// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { visit } from 'unist-util-visit';

const base = '/documentation';

// Starlight does not auto-prepend the base path to absolute links in markdown
// content. This plugin rewrites them at build time so content files stay
// deployment-agnostic (no hardcoded /documentation/ in every link).
function remarkPrependBase() {
	return (tree) => {
		visit(tree, ['link', 'definition'], (node) => {
			if (node.url && node.url.startsWith('/') && !node.url.startsWith('//')) {
				node.url = base + node.url;
			}
		});
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://xianix-team.github.io',
	base,
	markdown: {
		remarkPlugins: [remarkPrependBase],
	},
	integrations: [
		starlight({
			title: 'Xianix AI-DLC Docs',
			description: 'AI-powered automation for your development lifecycle.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/99x' },
			],
			sidebar: [
				{
					label: 'The Agent',
					items: [
						{ label: 'Overview', slug: 'agent/overview' },
						{ label: 'Architecture', slug: 'agent/architecture' },
						{ label: 'Setup', slug: 'agent/setup' },
						{ label: 'Rules Configuration', slug: 'agent/rules' },
						{ label: 'Executor', slug: 'agent/executor' },
						{ label: 'Tenant Isolation', slug: 'agent/tenant-isolation' },
						{ label: 'Azure Deployment', slug: 'agent/azure-deployment' },
					],
				},
				{
					label: 'Agent Installation',
					items: [
						{ label: 'Prerequisites', slug: 'agent-installation/prerequisites' },
						{ label: 'Quick Start', slug: 'agent-installation/quickstart' },
						{ label: 'Configuration Reference', slug: 'agent-installation/configuration' },
					],
				},
				{
					label: 'Plugins',
					items: [
						{ label: 'Marketplace Overview', slug: 'plugins/overview' },
						{
							label: 'PR Reviewer',
							items: [
								{ label: 'Overview', slug: 'plugins/pr-reviewer/overview' },
								{ label: 'Platform Setup', slug: 'plugins/pr-reviewer/platform-setup' },
								{ label: 'Git Authentication', slug: 'plugins/pr-reviewer/git-auth' },
							],
						},
						{
							label: 'Requirement Analyst',
							items: [
								{ label: 'Overview', slug: 'plugins/req-analyst/overview' },
								{ label: 'MCP Configuration', slug: 'plugins/req-analyst/mcp-config' },
								{ label: 'Backlog Setup', slug: 'plugins/req-analyst/backlog-setup' },
							],
						},
					],
				},
				{
					label: 'Plugin Development',
					items: [
						{ label: 'Plugin Structure', slug: 'plugin-development/overview' },
						{ label: 'Marketplace', slug: 'plugin-development/marketplace' },
					],
				},
				{
					label: 'Agent Development',
					items: [
						{ label: 'Overview', slug: 'agent-development/overview' },
						{ label: 'Project Structure', slug: 'agent-development/project-structure' },
						{ label: 'Workflows & Activities', slug: 'agent-development/workflows-and-activities' },
						{ label: 'Testing', slug: 'agent-development/testing' },
						{ label: 'Contributing', slug: 'agent-development/contributing' },
					],
				},
			],
		}),
	],
});
