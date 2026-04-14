import { Card, Grid } from "@arco-design/web-react";
import styles from "./index.module.less";
import { useNavigate } from "react-router-dom";

const apps = [
  {
    icon: "",
    title: "数据平台",
    subtitle: "Chemoinformatics Data",
    description: "CRO内置的化合物数据库",
    link: "",
  },
  {
    icon: "",
    title: "AIDD平台",
    subtitle: "AIDD",
    description: "基于人工智能和高性能计算的药物设计平台",
    link: "",
  },
  {
    icon: "",
    title: "自由能计算平台",
    subtitle: "Fep platform",
    description: "新一代药物结合自由能计算平台",
    link: "/fep",
  },
  {
    icon: "",
    title: "BioChem Agent",
    subtitle: "BioChem Agent",
    description: "药物设计智能Agent",
    link: "/agent",
  },
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid.Row gutter={[20, 36]}>
        {apps.map(({ title, subtitle, description, link }) => (
          <Grid.Col span={8}>
            <div
              className={styles.appItem}
              onClick={() => {
                navigate(link);
              }}
            >
              <Card title={title} extra={subtitle} hoverable>
                {description}
              </Card>
            </div>
          </Grid.Col>
        ))}
      </Grid.Row>
    </div>
  );
};

export default Home;
