"use client";

import {
  CloudUploadOutlined,
  HistoryOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import Link from "next/link";
import { useThemeMode } from "./AppProviders";

const { Header, Content, Sider } = Layout;

const navItems = [
  {
    key: "/",
    icon: <CloudUploadOutlined />,
    label: <Link href="/">上传</Link>
  },
  {
    key: "/history",
    icon: <HistoryOutlined />,
    label: <Link href="/history">历史记录</Link>
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">系统配置</Link>
  }
];

export function AppShell({ children, activeKey }: { children: React.ReactNode; activeKey: string }) {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Layout className="appLayout">
      <Sider breakpoint="lg" collapsedWidth="0" width={220} className="appSider">
        <div className="brand">
          <span className="brandMark">HR</span>
          <span>简历筛选</span>
        </div>
        <Menu mode="inline" selectedKeys={[activeKey]} items={navItems} className="navMenu" />
      </Sider>

      <Layout>
        <Header className="appHeader">
          <div className="headerTitle">人才评估工作台</div>
          <Button
            type="text"
            icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleMode}
          >
            {mode === "dark" ? "浅色" : "暗黑"}
          </Button>
        </Header>
        <Content className="appContent">{children}</Content>
      </Layout>
    </Layout>
  );
}
