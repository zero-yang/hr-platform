"use client";

import { CheckCircleOutlined } from "@ant-design/icons";
import { Alert, App as AntdApp, Button, Form, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { deepseekModelOptions, defaultConfig, loadConfig, saveConfig } from "@/lib/config";
import type { AppConfig } from "@/lib/types";

export default function SettingsPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<AppConfig>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    form.setFieldsValue(loadConfig());
  }, [form]);

  function handleSave(values: AppConfig) {
    saveConfig(values);
    setSaved(true);
    message.success("配置已保存到当前浏览器");
  }

  return (
    <AppShell activeKey="/settings">
      <div className="pageHeader">
        <div>
          <h1>系统配置</h1>
          <p>选择 DeepSeek 模型。Supabase 与 DeepSeek Key 由环境变量提供。</p>
        </div>
      </div>

      <section className="panel narrowPanel">
        <Form form={form} layout="vertical" initialValues={defaultConfig} onFinish={handleSave}>
          <Form.Item
            label="DeepSeek 模型"
            name="deepseekModel"
            rules={[{ required: true, message: "请选择模型" }]}
            extra="默认使用 DeepSeek V4 Flash；如需更高质量可选择 DeepSeek V4 Pro。"
          >
            <Select size="large" options={deepseekModelOptions} />
          </Form.Item>

          <Space wrap>
            <Button type="primary" htmlType="submit" size="large">
              保存配置
            </Button>
            {saved && (
              <span className="savedHint">
                <CheckCircleOutlined /> 已保存
              </span>
            )}
          </Space>
        </Form>
      </section>
    </AppShell>
  );
}
