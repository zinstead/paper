import type { RemoteWorkspace } from "@/store/agent";
import type { PaginationProps } from "@arco-design/web-react";
import axios from "axios";

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
