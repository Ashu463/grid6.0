/**
 * Copyright 2025 The Oppia Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Script to check and unassign inactive issues in Oppia repository.
 */

import axios from 'axios';

const INACTIVE_DAYS_THRESHOLD = 0.000000000000007;
const UNASSIGN_DAYS_THRESHOLD = 0.000000000001;
const REPO_OWNER = 'Ashu463';
const REPO_NAME = 'grid6.0';

interface AssigneeData {
  login: string;
}

interface IssueData {
  number: number;
  assignee: AssigneeData | null;
  events_url: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

interface LinkedIssue {
  number: number;
}

interface PullRequestNode {
  number: number;
  closingIssuesReferences: {
    nodes: LinkedIssue[];
  };
}

interface GraphQLResponse {
  data: {
    repository: {
      pullRequests: {
        pageInfo: PageInfo;
        nodes: PullRequestNode[];
      };
    };
  };
}

interface EventData {
  created_at: string;
  actor?: {
    login: string;
  };
}

class Issue {
  number: number;
  assignee_username: string | null;
  events_url: string;
  last_active_date: Date | null;

  constructor(
    number: number,
    assignee_username: string | null,
    events_url: string,
    last_active_date: Date | null = null,
  ) {
    this.number = number;
    this.assignee_username = assignee_username;
    this.events_url = events_url;
    this.last_active_date = last_active_date;
  }

  static fromGithubData(data: IssueData): Issue {
    const assignee_username = data.assignee ? data.assignee.login : null;

    return new Issue(data.number, assignee_username, data.events_url);
  }

  isInactiveForSevenDays(): boolean {
    if (!this.last_active_date) {
      return false;
    }

    const now = new Date();
    const days_inactive =
      (now.getTime() - this.last_active_date.getTime()) / (1000 * 60 * 60 * 24);
    return days_inactive > INACTIVE_DAYS_THRESHOLD;
  }

  isInactiveForTenDays(): boolean {
    if (!this.last_active_date) {
      return false;
    }

    const now = new Date();
    const days_inactive =
      (now.getTime() - this.last_active_date.getTime()) / (1000 * 60 * 60 * 24);
    return days_inactive > UNASSIGN_DAYS_THRESHOLD;
  }
}

class GitHubService {
  token: string;
  repo_owner: string;
  repo_name: string;
  rest_headers: Record<string, string>;
  graphql_headers: Record<string, string>;
  base_url: string;

  constructor(token: string, repo_owner: string, repo_name: string) {
    this.token = token;
    this.repo_owner = repo_owner;
    this.repo_name = repo_name;
    this.rest_headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };
    this.graphql_headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    this.base_url = `https://api.github.com/search/issues?q=repo:${repo_owner}/${repo_name}+is:issue+state:open`;
  }

  async getOpenIssues(): Promise<Issue[]> {
    const search_url = 'https://api.github.com/search/issues';
    const url = `${search_url}?q=repo:${this.repo_owner}/${this.repo_name}+is:issue+state:open`;

    const response = await axios.get(url, { headers: this.rest_headers });
    if (!response) {
      throw new Error('Received null response while fetching issues');
    }

    const issues_list: Issue[] = [];
    console.log(response, ' is the response');
    // Search API returns issues in the 'items' array
    for (const issue_data of response.data.items) {
      const typed_issue_data: IssueData = {
        number: issue_data.number,
        assignee: issue_data.assignee,
        events_url: issue_data.events_url,
      };
      const issue = Issue.fromGithubData(typed_issue_data);
      issues_list.push(issue);
    }

    return issues_list;
  }

  async getRepoCollaborators(): Promise<Set<string>> {
    const url = `${this.base_url}/collaborators`;
    const response = await axios.get(url, { headers: this.rest_headers });

    if (!response) {
      throw new Error('Received null response while fetching collaborators');
    }

    const collaborators = new Set<string>();
    for (const collaborator_dict of response.data) {
      collaborators.add(collaborator_dict.login);
    }

    return collaborators;
  }

  async getIssueEvents(issue: Issue): Promise<Date | null> {
    const response = await axios.get(issue.events_url, {
      headers: this.rest_headers,
    });
    if (!response) {
      throw new Error('Received null response while fetching events');
    }

    const events_dict: EventData[] = response.data;

    if (!events_dict.length) {
      return null;
    }

    const assignee_events = events_dict.filter(
      (event) => event.actor?.login === issue.assignee_username,
    );

    if (!assignee_events.length) {
      return null;
    }

    const dates = assignee_events.map((event) => new Date(event.created_at));
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }

  async getIssuesWithPrs(): Promise<Map<number, Set<number>>> {
    const query = `
    query($owner: String!, $name: String!, $cursor: String) {
      repository(owner: $owner, name: $name) {
        pullRequests(first: 100, states: [OPEN], after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            number
            closingIssuesReferences(first: 1) {
              nodes {
                number
              }
            }
          }
        }
      }
    }
    `;

    const req_credentials = {
      owner: this.repo_owner,
      name: this.repo_name,
      cursor: null as string | null,
    };

    const issue_to_prs = new Map<number, Set<number>>();
    let has_next_page = true;

    while (has_next_page) {
      const response = await axios.post(
        'https://api.github.com/graphql',
        { query, variables: req_credentials },
        { headers: this.graphql_headers },
      );

      if (!response) {
        throw new Error('Received null response while fetching PRs');
      }

      const data = response.data as GraphQLResponse;
      const pull_requests = data.data.repository.pullRequests;

      for (const pr of pull_requests.nodes) {
        const pr_number = pr.number;
        const linked_issues = pr.closingIssuesReferences.nodes || [];

        for (const issue of linked_issues) {
          const issue_number = issue.number;

          if (!issue_to_prs.has(issue_number)) {
            issue_to_prs.set(issue_number, new Set<number>());
          }

          issue_to_prs.get(issue_number)!.add(pr_number);
        }
      }

      const page_info = pull_requests.pageInfo;
      has_next_page = page_info.hasNextPage;
      req_credentials.cursor = page_info.endCursor;
    }

    return issue_to_prs;
  }

  async unassignIssue(issue: Issue): Promise<boolean> {
    if (!issue.assignee_username) {
      return false;
    }

    const url = `${this.base_url}/issues/${issue.number}/assignees`;
    const response = await axios.delete(url, {
      headers: this.rest_headers,
      data: { assignees: [issue.assignee_username] },
    });

    if (!response) {
      throw new Error('Received null response while unassigning issue');
    }

    return response.status === 200;
  }

  async addAlertCommentOnIssue(issue: Issue): Promise<void> {
    const url = `${this.base_url}/issues/${issue.number}/comments`;
    const comment =
      `Hi @${issue.assignee_username}, it looks like you have been ` +
      `assigned to this issue for ${Math.floor(INACTIVE_DAYS_THRESHOLD)} days, ` +
      `but have not created a PR yet.\n\n If you are still planning to ` +
      `work on this issue, please open a PR within the next ` +
      `${Math.floor(UNASSIGN_DAYS_THRESHOLD - INACTIVE_DAYS_THRESHOLD)} days ` +
      `and submit it for review, making sure that it is linked to this ` +
      `issue in the Development sidebar of the PR. Otherwise, ` +
      `please unassign yourself from this issue so that someone ` +
      `else can take it up.\n\n Also, if you are stuck, please let us ` +
      `know, so that we can help you. Thanks!`;

    const response = await axios.post(
      url,
      { body: comment },
      { headers: this.rest_headers },
    );

    if (!response) {
      throw new Error('Received null response while commenting on issue');
    }
  }

  async postUnassignmentComment(issue: Issue): Promise<void> {
    const url = `${this.base_url}/issues/${issue.number}/comments`;
    const comment =
      `Unassigning @${issue.assignee_username} from this issue, ` +
      `due to their inactivity for more than 10 days. \n\n` +
      `This issue is now open for other contributors to take up.`;

    const response = await axios.post(
      url,
      { body: comment },
      { headers: this.rest_headers },
    );

    if (!response) {
      throw new Error('Received null response while commenting on issue');
    }
  }
}

class IssueManager {
  github: GitHubService;

  constructor(github_service: GitHubService) {
    this.github = github_service;
  }

  async getInactiveIssues(): Promise<Issue[]> {
    const issues = await this.github.getOpenIssues();
    const collaborators = await this.github.getRepoCollaborators();
    const issues_with_prs = await this.github.getIssuesWithPrs();

    const inactive_issues: Issue[] = [];

    for (const issue of issues) {
      if (!issue.assignee_username) {
        continue;
      }

      if (collaborators.has(issue.assignee_username)) {
        console.log(
          `Skipping issue #${issue.number}: assignee ${issue.assignee_username} is a collaborator`,
        );
        continue;
      }

      if (issues_with_prs.has(issue.number)) {
        console.log(
          `Skipping issue #${issue.number}: has open PR #${Array.from(issues_with_prs.get(issue.number)!).join(', #')}`,
        );
        continue;
      }

      issue.last_active_date = await this.github.getIssueEvents(issue);

      if (issue.isInactiveForSevenDays()) {
        await this.github.addAlertCommentOnIssue(issue);
        console.log(
          `Issue #${issue.number} has been inactive for >${INACTIVE_DAYS_THRESHOLD} days`,
        );
      }

      if (issue.isInactiveForTenDays()) {
        inactive_issues.push(issue);
        console.log(
          `Issue #${issue.number} has been inactive for >${UNASSIGN_DAYS_THRESHOLD} days`,
        );
      }
    }

    return inactive_issues;
  }

  async unassignIssues(issues: Issue[]): Promise<void> {
    for (const issue of issues) {
      try {
        if (await this.github.unassignIssue(issue)) {
          await this.github.postUnassignmentComment(issue);
          console.log(
            `Unassigned issue #${issue.number} from ${issue.assignee_username}`,
          );
        } else {
          console.error(`Failed to unassign issue #${issue.number}`);
        }
      } catch (e) {
        console.error(`Error processing issue #${issue.number}: ${e}`);
      }
    }
  }
}

export async function main(): Promise<void> {
  const github_token = process.env.GITHUB_TOKEN;

  if (!github_token) {
    console.error('GITHUB_TOKEN environment variable is not set');
    process.exit(1);
  }

  const gh_service = new GitHubService(github_token, REPO_OWNER, REPO_NAME);
  const issue_manager = new IssueManager(gh_service);
  // all_inactive_issues means all those issues which are inactive from
  // more than UNASSIGN_DAYS_THRESHOLD days.
  const all_inactive_issues = await issue_manager.getInactiveIssues();

  if (all_inactive_issues.length) {
    console.log('The following issues will be unassigned:');
    for (const inactive_issue of all_inactive_issues) {
      console.log(
        `Issue #${inactive_issue.number} (assignee: ${inactive_issue.assignee_username})`,
      );
    }

    const deassign_inactive = process.env.DEASSIGN_INACTIVE_CONTRIBUTORS;
    if (deassign_inactive === 'true') {
      await issue_manager.unassignIssues(all_inactive_issues);
      console.log('Inactive issues are sent for deassigning.');
    } else {
      console.log('Unassignment is currently disabled.');
    }
  } else {
    console.log('No inactive issues found that need unassignment.');
  }
}

// Only run when script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error in main execution:', error);
    process.exit(1);
  });
}
