import { Card, Descriptions, Space, Typography } from "@arco-design/web-react";
import ABFEPResults from "./ABFEPResult";

const TaskResult = () => {
  const baseInfo = [
    { label: "ID", value: "123" },
    { label: "Name", value: "Benchmark_JAK2" },
    { label: "Description", value: "test" },
    { label: "Type", value: "ABFEP" },
    { label: "Status", value: "success" },
    { label: "Creator", value: "zhangsan" },
    { label: "Create At", value: "2025-09-02 16:30" },
  ];

  const baseData = baseInfo.map(({ label, value }) => ({
    label: <div style={{ width: 180 }}>{label}</div>,
    value: <div style={{ width: 80 }}>{value}</div>,
  }));

  const config = [
    { label: "Computing Engine", value: "FEP+" },
    { label: "Force Field", value: "OPLS4" },
    { label: "Solvent Model", value: "TIP3P" },
    { label: "Temperature", value: "300 K" },
    { label: "λ Window Number", value: "12" },
    { label: "Creator", value: "creator" },
    { label: "ligand quantity", value: "5" },
  ];

  const configData = config.map(({ label, value }) => ({
    label: <div style={{ width: 180 }}>{label}</div>,
    value: <div style={{ width: 80 }}>{value}</div>,
  }));

  return (
    <Space size={20} direction="vertical" style={{ width: "100%" }}>
      <Typography.Title heading={4}>Task Result</Typography.Title>
      <Card title="Base">
        <Descriptions column={3} data={baseData} />
      </Card>
      <Card title="Config">
        <Descriptions column={3} data={configData} />
      </Card>
      <ABFEPResults />
    </Space>
  );
};

export default TaskResult;
