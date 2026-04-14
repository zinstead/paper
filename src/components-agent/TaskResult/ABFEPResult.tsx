import React, { useMemo } from "react";
import {
  Table,
  Card,
  Space,
  Typography,
  Divider,
  Grid,
  Tag,
  Tooltip,
} from "@arco-design/web-react";
import { IconCheckCircle, IconCloseCircle } from "@arco-design/web-react/icon";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";

const { Title, Text } = Typography;
const { Row, Col } = Grid;

// ---------- 模拟 ABFEP 数据 ----------
interface LigandABFEPData {
  key: string;
  ligand: string;
  dg: number; // 绝对结合自由能 (kcal/mol)
  dg_error: number; // 误差
  dg_corrected: number; // 修正后的 dg
  dg_corrected_error: number; // 修正误差
  reference: string; // 参考态描述
  dg_water: number; // 水相贡献
  dg_protein: number; // 蛋白贡献
  dg_restraints: number; // 限制势贡献
  convergence: "good" | "fair"; // 收敛性
  overlap: number; // 相空间重叠度 (0~1)
  exp_dg: number; // 实验值（用于验证）
}

const ligandData: LigandABFEPData[] = [
  {
    key: "1",
    ligand: "Compound A",
    dg: -7.23,
    dg_error: 0.21,
    dg_corrected: -7.45,
    dg_corrected_error: 0.23,
    reference: "apo",
    dg_water: 2.34,
    dg_protein: -9.67,
    dg_restraints: 0.1,
    convergence: "good",
    overlap: 0.82,
    exp_dg: -7.5,
  },
  {
    key: "2",
    ligand: "Compound B",
    dg: -8.91,
    dg_error: 0.18,
    dg_corrected: -9.12,
    dg_corrected_error: 0.2,
    reference: "apo",
    dg_water: 1.95,
    dg_protein: -11.05,
    dg_restraints: 0.19,
    convergence: "good",
    overlap: 0.78,
    exp_dg: -9.0,
  },
  {
    key: "3",
    ligand: "Compound C",
    dg: -5.42,
    dg_error: 0.32,
    dg_corrected: -5.61,
    dg_corrected_error: 0.35,
    reference: "apo",
    dg_water: 3.1,
    dg_protein: -8.71,
    dg_restraints: 0.18,
    convergence: "fair",
    overlap: 0.65,
    exp_dg: -5.8,
  },
  {
    key: "4",
    ligand: "Compound D",
    dg: -6.78,
    dg_error: 0.25,
    dg_corrected: -6.95,
    dg_corrected_error: 0.27,
    reference: "apo",
    dg_water: 2.67,
    dg_protein: -9.53,
    dg_restraints: 0.08,
    convergence: "good",
    overlap: 0.85,
    exp_dg: -6.9,
  },
  {
    key: "5",
    ligand: "Compound E",
    dg: -9.34,
    dg_error: 0.2,
    dg_corrected: -9.58,
    dg_corrected_error: 0.22,
    reference: "apo",
    dg_water: 1.88,
    dg_protein: -11.22,
    dg_restraints: 0.0,
    convergence: "good",
    overlap: 0.79,
    exp_dg: -9.4,
  },
];

// 表格列定义
const columns = [
  {
    title: "Ligand",
    dataIndex: "ligand",
    key: "ligand",
    width: 110,
    fixed: "left" as const,
  },
  {
    title: "ΔG (kcal/mol)",
    dataIndex: "dg",
    key: "dg",
    width: 110,
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "ΔG Error",
    dataIndex: "dg_error",
    key: "dg_error",
    width: 100,
    render: (v: number) => `±${v.toFixed(2)}`,
  },
  {
    title: "ΔG Corr.",
    dataIndex: "dg_corrected",
    key: "dg_corrected",
    width: 110,
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "Corr. Error",
    dataIndex: "dg_corrected_error",
    key: "dg_corrected_error",
    width: 100,
    render: (v: number) => `±${v.toFixed(2)}`,
  },
  { title: "Reference", dataIndex: "reference", key: "reference", width: 100 },
  {
    title: "ΔG Water",
    dataIndex: "dg_water",
    key: "dg_water",
    width: 100,
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "ΔG Protein",
    dataIndex: "dg_protein",
    key: "dg_protein",
    width: 100,
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "ΔG Restr.",
    dataIndex: "dg_restraints",
    key: "dg_restraints",
    width: 100,
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "Convergence",
    dataIndex: "convergence",
    key: "convergence",
    width: 120,
    render: (v: "good" | "fair") => (
      <Tag
        color={v === "good" ? "green" : "orange"}
        icon={v === "good" ? <IconCheckCircle /> : <IconCloseCircle />}
      >
        {v.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Overlap",
    dataIndex: "overlap",
    key: "overlap",
    width: 100,
    render: (v: number) => (
      <Tooltip content="相空间重叠度，越接近1越好">
        <Text>{v.toFixed(2)}</Text>
      </Tooltip>
    ),
  },
  {
    title: "Exp. ΔG (kcal/mol)",
    dataIndex: "exp_dg",
    key: "exp_dg",
    width: 140,
    render: (v: number) => v.toFixed(2),
  },
];

// 计算相关性指标 (R², RMSE, MUE)
const calculateMetrics = (data: LigandABFEPData[]) => {
  const n = data.length;
  const expValues = data.map((d) => d.exp_dg);
  const calcValues = data.map((d) => d.dg_corrected); // 使用 corrected 值对比

  const rmse = Math.sqrt(
    expValues.reduce((sum, exp, i) => sum + (exp - calcValues[i]) ** 2, 0) / n,
  );
  const mue =
    expValues.reduce((sum, exp, i) => sum + Math.abs(exp - calcValues[i]), 0) /
    n;
  const meanExp = expValues.reduce((a, b) => a + b, 0) / n;
  const ssTot = expValues.reduce((sum, exp) => sum + (exp - meanExp) ** 2, 0);
  const ssRes = expValues.reduce(
    (sum, exp, i) => sum + (exp - calcValues[i]) ** 2,
    0,
  );
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { r2, rmse, mue };
};

// 主组件
const ABFEPResults: React.FC = () => {
  const { r2, rmse, mue } = useMemo(() => calculateMetrics(ligandData), []);

  // 散点图数据
  const scatterData = ligandData.map((d) => ({
    ligand: d.ligand,
    exp: d.exp_dg,
    calc: d.dg_corrected,
  }));

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card
          title="Statistical indicators"
          style={{ width: 800, marginBottom: 20 }}
        >
          <Row gutter={24}>
            <Col span={8} style={{ textAlign: "center" }}>
              <Text type="secondary">R²</Text>
              <Title
                heading={3}
                style={{ margin: "4px 0 0", color: "#165DFF" }}
              >
                {r2.toFixed(3)}
              </Title>
            </Col>
            <Col span={8} style={{ textAlign: "center" }}>
              <Text type="secondary">RMSE (kcal/mol)</Text>
              <Title
                heading={3}
                style={{ margin: "4px 0 0", color: "#165DFF" }}
              >
                {rmse.toFixed(3)}
              </Title>
            </Col>
            <Col span={8} style={{ textAlign: "center" }}>
              <Text type="secondary">MUE (kcal/mol)</Text>
              <Title
                heading={3}
                style={{ margin: "4px 0 0", color: "#165DFF" }}
              >
                {mue.toFixed(3)}
              </Title>
            </Col>
          </Row>
        </Card>

        <Card
          title="Convergence and Overlap"
          style={{ width: 800, marginBottom: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Convergence distribution</Text>
              <div>
                <Tag color="green" icon={<IconCheckCircle />}>
                  Good:{" "}
                  {ligandData.filter((d) => d.convergence === "good").length}
                </Tag>{" "}
                <Tag color="orange" icon={<IconCloseCircle />}>
                  Fair:{" "}
                  {ligandData.filter((d) => d.convergence === "fair").length}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Average overlap</Text>
              <Title heading={5} style={{ marginTop: 4 }}>
                {(
                  ligandData.reduce((sum, d) => sum + d.overlap, 0) /
                  ligandData.length
                ).toFixed(3)}
              </Title>
              <Text type="secondary">
                Range:{" "}
                {Math.min(...ligandData.map((d) => d.overlap)).toFixed(2)} ~{" "}
                {Math.max(...ligandData.map((d) => d.overlap)).toFixed(2)}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* 验证图表与统计指标 */}
        <Card
          title="Experiment vs Calculate ΔG Correlation"
          bordered
          style={{ width: 800, marginBottom: 20, aspectRatio: 4 / 3 }}
        >
          <ScatterChart
            width={750}
            height={600}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="exp"
              name="Experiment ΔG"
              //   unit=" kcal/mol"
              domain={["auto", "auto"]}
              label={{
                value: "Experiment ΔG (kcal/mol)",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              type="number"
              dataKey="calc"
              name="Calculate ΔG"
              //   unit=" kcal/mol"
              domain={["auto", "auto"]}
              label={{
                value: "Calculate ΔG (kcal/mol)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ReTooltip
              cursor={{ strokeDasharray: "3 3" }}
              //   formatter={(value: number, name: string) => [`${value.toFixed(2)} kcal/mol`, name === 'exp' ? '实验值' : '计算值']}
              labelFormatter={(label) => `实验值: ${label}`}
            />
            {/* <Legend /> */}
            <ReferenceLine
              segment={[
                { x: -10, y: -10 },
                { x: -4, y: -4 },
              ]}
              stroke="#999"
              strokeDasharray="5 5"
              label={<Label value="y = x" position="top" fill="#999" />}
            />
            <Scatter
              name="Compound"
              data={scatterData}
              fill="#165DFF"
              shape="circle"
            />
          </ScatterChart>
        </Card>
      </div>

      {/* 表格区域 - 横向滚动支持 */}
      <Typography.Title heading={5}>ΔG Table</Typography.Title>
      <Table
        columns={columns}
        data={ligandData}
        border={true}
        pagination={false}
        size="small"
        stripe
        scroll={{ x: 1400 }}
      />
    </div>
  );
};

export default ABFEPResults;
