export interface InitWizardOptions {
  isInteractive?: boolean;
  yes?: boolean;
  hub?: boolean;
  mode?: 'single' | 'multi';
  skill?: boolean;
  agentsMd?: boolean;
  packageJson?: boolean;
  gitignore?: boolean;
  force?: boolean;
}

export interface InitWizardResults {
  mode: 'single' | 'multi';
  devboardConfig: boolean;
  tasksDir: boolean;
  skill: boolean;
  agentsMd: boolean;
  packageJson: boolean;
  gitignore: boolean;
  registeredInHub: boolean;
}

export function getSkillTemplate(): string;
export function getAgentsMdTemplate(projectName: string): string;
export function runInitWizard(targetRepo?: string, options?: InitWizardOptions): Promise<InitWizardResults>;
