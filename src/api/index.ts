import type { Message, RemoteWorkspace } from "@/store/agent";
import {
  buildFilterQuery,
  buildLimitQuery,
  buildSorterQuery,
} from "@/utils/agent.ts";
import type { PaginationProps } from "@arco-design/web-react";
import axios from "axios";
import { isEmpty, isNil, omitBy } from "lodash";

const apiPrefix = "http://localhost:3000";

export async function getProjects(params: { pagination: PaginationProps }) {
  const { pagination } = params;
  const { current, pageSize } = pagination;
  return (
    await axios.get(
      `${apiPrefix}/projects?_page=${current}&_per_page=${pageSize}`,
    )
  ).data;
}

export async function createProject(projectData: any) {
  return (await axios.post(`${apiPrefix}/projects`, projectData)).data;
}

export async function getUsers() {
  return (await axios.get(`${apiPrefix}/users`)).data;
}

export async function getTasks() {
  return (await axios.get(`${apiPrefix}/tasks`)).data;
}

export async function getWorkspaces(params: { pagination: PaginationProps }) {
  const { pagination } = params;
  const { current, pageSize } = pagination;
  return (
    await axios.get(
      `${apiPrefix}/workspaces?_page=${current}&_per_page=${pageSize}`,
    )
  ).data;
}

export async function getWorkspace(id: string) {
  return (await axios.get(`${apiPrefix}/workspaces/${id}`)).data;
}

export async function createWorkspace(data: Partial<RemoteWorkspace>) {
  const res = await axios.post(`${apiPrefix}/workspaces`, data);
  return res.data;
}

export async function updateWorkspace(
  id: string,
  data: Partial<RemoteWorkspace>,
) {
  return (await axios.patch(`${apiPrefix}/workspaces/${id}`, data)).data;
}

export async function removeWorkspace(id: string) {
  return (await axios.delete(`${apiPrefix}/workspaces/${id}`)).data;
}

export interface FilterConditionSchema {
  field: string;
  operator: string;
  value: any;
}

export type MoleculeFiltersSchema = FilterConditionSchema[];

// export interface MoleculeFiltersSchema {
//   logic: "and" | "or";
//   conditions: (FilterConditionSchema | MoleculeFiltersSchema)[];
// }

export interface MoleculeSorterSchema {
  sortBy: string;
  order: "asc" | "desc";
}

export async function parseUserIntent(messages: Message[]) {
  const res = await axios.post(`http://localhost:5000/api/agent/intent`, {
    messages,
  });
  return res.data;
}

export async function filterMolecules(params: {
  filterApi: string;
  userGoal: string;
  filters?: MoleculeFiltersSchema;
}) {
  const res = await axios.post(
    `http://localhost:5000/api/agent/filter`,
    omitBy(params, isEmpty),
  );
  return res.data;
}

export async function getMolecules(params: {
  pagination: PaginationProps;
  filters?: MoleculeFiltersSchema;
  sorter?: MoleculeSorterSchema;
  limit?: number;
}) {
  const { pagination, filters, sorter, limit } = params;
  const current = pagination.current!;
  const pageSize = pagination.pageSize!;

  // const paginationStr = `_page=${current}&_per_page=${pageSize}`;
  const filtersQuery = isEmpty(filters) ? "" : "&" + buildFilterQuery(filters);
  const sorterQuery = isEmpty(sorter) ? "" : "&" + buildSorterQuery(sorter);
  // const limitQuery = isNil(limit) ? "" : "&" + buildLimitQuery(limit);

  const api = `${apiPrefix}/molecules?${filtersQuery}${sorterQuery}`;

  let data = (await axios.get(api)).data;
  if (!isNil(limit)) {
    const count = Math.min(data.length, limit);
    data = data.slice(0, count);
  }

  const start = (current! - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  return { total: data.length, data: paginatedData };
}
