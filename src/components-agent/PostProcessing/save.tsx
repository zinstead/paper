import React, { useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Grid,
} from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import * as echarts from "echarts";

const { Title, Text } = Typography;
const { Row, Col } = Grid;

// 模拟数据生成函数
const generateConvergenceData = () => {
  const times = Array.from({ length: 101 }, (_, i) => i); // 0-100 ns
  const dG = times.map((t) => {
    // 从0逐渐收敛到-8.3，加入噪声
    const value = -8.3 * (1 - Math.exp(-t / 25)) + (Math.random() - 0.5) * 0.2;
    return parseFloat(value.toFixed(2));
  });
  return { times, dG };
};

const generateOverlapMatrix = (nWindows = 10) => {
  const data: [number, number, number][] = [];
  for (let i = 0; i < nWindows; i++) {
    for (let j = 0; j < nWindows; j++) {
      let overlap = 0;
      if (i === j) overlap = 1.0;
      else if (Math.abs(i - j) === 1) overlap = 0.7 + Math.random() * 0.2;
      else if (Math.abs(i - j) === 2) overlap = 0.3 + Math.random() * 0.2;
      else overlap = 0.05 + Math.random() * 0.1;
      data.push([i, j, parseFloat(overlap.toFixed(3))]);
    }
  }
  return { data, nWindows };
};

const generateDvDlambda = () => {
  const lambdas = Array.from({ length: 11 }, (_, i) => i / 10);
  const means = lambdas.map((l) => -40 * l + 5 * Math.sin(l * Math.PI));
  const stds = lambdas.map(() => 2 + Math.random() * 3);
  return { lambdas, means, stds };
};

const generateResidueDecomposition = () => {
  const residues = ["TYR32", "ASP45", "PHE98", "LYS101", "TRP201", "GLU87"];
  const contributions = [-1.2, -2.5, -3.1, -0.8, -1.9, -2.2];
  return { residues, contributions };
};

const ABFEPPostProcessing: React.FC = () => {
  const convergenceRef = useRef<HTMLDivElement>(null);
  const overlapRef = useRef<HTMLDivElement>(null);
  const dvdlRef = useRef<HTMLDivElement>(null);
  const residueRef = useRef<HTMLDivElement>(null);

  // 收敛曲线数据
  const { times, dG } = generateConvergenceData();
  // 重叠矩阵数据
  const { data: overlapData, nWindows } = generateOverlapMatrix(12);
  // dV/dλ数据
  const { lambdas, means, stds } = generateDvDlambda();
  // 残基分解数据
  const { residues, contributions } = generateResidueDecomposition();

  useEffect(() => {
    // 自由能收敛曲线
    if (convergenceRef.current) {
      const chart = echarts.init(convergenceRef.current);
      chart.setOption({
        title: { text: "自由能收敛曲线", left: "center" },
        tooltip: {
          trigger: "axis",
          valueFormatter: (value: number) => value.toFixed(2) + " kcal/mol",
        },
        xAxis: { name: "时间 (ns)", nameLocation: "middle", nameGap: 30 },
        yAxis: { name: "ΔG (kcal/mol)", nameLocation: "middle", nameGap: 40 },
        series: [
          {
            type: "line",
            data: dG,
            smooth: true,
            lineStyle: { color: "#5470c6", width: 2 },
            areaStyle: { opacity: 0.1, color: "#5470c6" },
            symbol: "none",
          },
        ],
        grid: { containLabel: true, left: 50, right: 20, top: 60, bottom: 30 },
      });
      return () => chart.dispose();
    }
  }, [dG]);

  useEffect(() => {
    // 重叠矩阵热图
    if (overlapRef.current) {
      const chart = echarts.init(overlapRef.current);
      const xAxis = Array.from({ length: nWindows }, (_, i) => `λ${i}`);
      chart.setOption({
        title: { text: "λ窗口重叠矩阵", left: "center" },
        tooltip: {
          position: "top",
          formatter: (params: any) =>
            `窗口 ${params.value[0]} ↔ ${params.value[1]}: ${params.value[2]}`,
        },
        xAxis: { type: "category", data: xAxis, name: "λ窗口" },
        yAxis: { type: "category", data: xAxis, name: "λ窗口" },
        visualMap: {
          min: 0,
          max: 1,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 10,
          inRange: { color: ["#ffffff", "#91cc75", "#fac858", "#ee6666"] },
        },
        series: [
          {
            type: "heatmap",
            data: overlapData,
            label: { show: false },
            emphasis: { itemStyle: { shadowBlur: 10 } },
          },
        ],
        grid: { containLabel: true, left: 50, right: 20, top: 60, bottom: 50 },
      });
      return () => chart.dispose();
    }
  }, [overlapData, nWindows]);

  useEffect(() => {
    // dV/dλ曲线 + 误差带
    if (dvdlRef.current) {
      const chart = echarts.init(dvdlRef.current);
      const upper = means.map((m, i) => m + stds[i]);
      const lower = means.map((m, i) => m - stds[i]);
      chart.setOption({
        title: { text: "dV/dλ 曲线 (含标准差带)", left: "center" },
        tooltip: {
          trigger: "axis",
          valueFormatter: (value: number) => value.toFixed(1) + " kcal/mol",
        },
        xAxis: { name: "λ", type: "value", min: 0, max: 1 },
        yAxis: {
          name: "∂U/∂λ (kcal/mol)",
          nameLocation: "middle",
          nameGap: 40,
        },
        series: [
          {
            name: "均值",
            type: "line",
            data: means.map((v, i) => [lambdas[i], v]),
            smooth: true,
            lineStyle: { color: "#3c7cb9", width: 2 },
            symbol: "circle",
            symbolSize: 6,
          },
          {
            name: "标准差范围",
            type: "line",
            data: upper.map((v, i) => [lambdas[i], v]),
            lineStyle: { opacity: 0 },
            symbol: "none",
            areaStyle: { opacity: 0.3, color: "#3c7cb9" },
            smooth: true,
          },
          {
            name: "标准差范围",
            type: "line",
            data: lower.map((v, i) => [lambdas[i], v]),
            lineStyle: { opacity: 0 },
            symbol: "none",
            areaStyle: { opacity: 0.3, color: "#3c7cb9" },
            smooth: true,
          },
        ],
        legend: { data: ["均值", "标准差范围"], left: "left" },
        grid: { containLabel: true, left: 60, right: 20, top: 60, bottom: 30 },
      });
      return () => chart.dispose();
    }
  }, [lambdas, means, stds]);

  useEffect(() => {
    // 残基能量分解柱状图
    if (residueRef.current) {
      const chart = echarts.init(residueRef.current);
      chart.setOption({
        title: { text: "关键残基结合贡献分解", left: "center" },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          valueFormatter: (value: number) => value.toFixed(2) + " kcal/mol",
        },
        xAxis: {
          type: "category",
          data: residues,
          name: "残基",
          axisLabel: { rotate: 45 },
        },
        yAxis: {
          type: "value",
          name: "ΔΔG (kcal/mol)",
          nameLocation: "middle",
          nameGap: 40,
        },
        series: [
          {
            type: "bar",
            data: contributions,
            itemStyle: {
              color: (params: any) => {
                const val = params.value;
                return val < 0 ? "#73c0de" : "#f28b82";
              },
              borderRadius: [4, 4, 0, 0],
            },
            label: {
              show: true,
              position: "top",
              formatter: (p: any) => p.value.toFixed(1),
            },
          },
        ],
        grid: { containLabel: true, left: 50, right: 20, top: 60, bottom: 50 },
      });
      return () => chart.dispose();
    }
  }, [residues, contributions]);

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 标题和摘要卡片 */}
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Title heading={3}>ABFEP 后处理分析报告</Title>
          <Text type="secondary">
            配体: LIG_01 | 体系: 激酶靶点 (PDB: 3ERT) | 模拟时间: 100 ns
          </Text>
          <Descriptions
            colon
            layout="inline-horizontal"
            style={{ marginTop: 20 }}
            column={3}
            data={[
              {
                label: "预测结合自由能 (ΔG)",
                value: <Tag color="green">-8.32 ± 0.41 kcal/mol</Tag>,
              },
              { label: "溶剂化自由能", value: "-3.21 ± 0.23 kcal/mol" },
              { label: "结合自由能 (复合物)", value: "-11.78 ± 0.52 kcal/mol" },
              { label: "蛋白重组能", value: "2.25 ± 0.18 kcal/mol" },
              {
                label: "收敛判定",
                value: <Tag color="blue">已收敛 (R-hat &lt; 1.05)</Tag>,
              },
              { label: "有效采样点数", value: "~2450 / 窗口" },
            ]}
          />
        </Card>

        {/* 第一行图表：收敛曲线 + 重叠矩阵 */}
        <Row gutter={24}>
          <Col span={12}>
            <Card bordered style={{ borderRadius: 12, height: 420 }}>
              <div
                ref={convergenceRef}
                style={{ width: "100%", height: 360 }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered style={{ borderRadius: 12, height: 420 }}>
              <div ref={overlapRef} style={{ width: "100%", height: 360 }} />
            </Card>
          </Col>
        </Row>

        {/* 第二行图表：dV/dλ曲线 + 残基分解 */}
        <Row gutter={24}>
          <Col span={12}>
            <Card bordered style={{ borderRadius: 12, height: 420 }}>
              <div ref={dvdlRef} style={{ width: "100%", height: 360 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered style={{ borderRadius: 12, height: 420 }}>
              <div ref={residueRef} style={{ width: "100%", height: 360 }} />
            </Card>
          </Col>
        </Row>

        {/* 可添加额外诊断信息卡片 */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, backgroundColor: "#fafafa" }}
        >
          <Space>
            <Text bold>后处理状态：</Text>
            <Text>
              ✅ 所有窗口采样平衡 | ✅ 重叠矩阵均满足最低阈值 (&gt;0.1) | ✅
              滞后误差 &lt;0.5 kcal/mol
            </Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ABFEPPostProcessing;
