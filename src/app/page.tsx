"use client";

import { InboxOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Progress, Space, Table, Tag, Upload, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { hasRequiredConfig, loadConfig } from "@/lib/config";
import { findJobPost } from "@/lib/supabase";
import type { ProcessingResult } from "@/lib/types";
import { processResumeFile } from "@/lib/workflow";

const { Dragger } = Upload;

export default function UploadPage() {
  const [form] = Form.useForm<{ jobName: string }>();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const config = useMemo(loadConfig, []);

  const columns: ColumnsType<ProcessingResult> = [
    {
      title: "文件",
      dataIndex: "fileName",
      width: 180
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status) => (status === "success" ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>)
    },
    {
      title: "姓名",
      dataIndex: "name",
      width: 100
    },
    {
      title: "求职岗位",
      dataIndex: "targetPosition",
      width: 140
    },
    {
      title: "评分",
      dataIndex: "resumeScore",
      width: 90,
      sorter: (a, b) => Number(a.resumeScore) - Number(b.resumeScore)
    },
    {
      title: "总结评价",
      dataIndex: "evaluation",
      ellipsis: true
    },
    {
      title: "错误",
      dataIndex: "error",
      ellipsis: true
    }
  ];

  async function handleProcess() {
    const { jobName } = await form.validateFields();

    if (!hasRequiredConfig(config)) {
      message.error("请先配置 Supabase 环境变量，并在系统配置页选择模型");
      return;
    }

    const pdfFiles = files
      .map((item) => item.originFileObj)
      .filter((file): file is RcFile => Boolean(file));

    if (pdfFiles.length === 0) {
      message.warning("请先上传 PDF 简历");
      return;
    }

    setProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    try {
      const jobInfo = await findJobPost(config, jobName);
      const nextResults: ProcessingResult[] = [];

      for (const [index, file] of pdfFiles.entries()) {
        setCurrentIndex(index + 1);
        const result = await processResumeFile(config, file, jobName, jobInfo);
        nextResults.push(result);
        setResults([...nextResults]);
      }

      message.success("批量处理完成");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AppShell activeKey="/">
      <div className="pageHeader">
        <div>
          <h1>简历上传</h1>
          <p>上传一批 PDF 简历，系统会按岗位标准提取信息、评分并保存到人才库。</p>
        </div>
      </div>

      {!hasRequiredConfig(config) && (
        <Alert
          showIcon
          type="warning"
          message="配置未完成"
          description="请先在环境变量中配置 Supabase URL 和 Supabase publishable/anon key，并在系统配置页选择模型。"
          className="sectionGap"
        />
      )}

      <section className="panel">
        <Form form={form} layout="vertical">
          <Form.Item
            label="岗位名称"
            name="jobName"
            rules={[{ required: true, message: "请输入岗位名称" }]}
            extra="岗位名称会用于从 Supabase 的 job_post 表中读取岗位要求和评分标准。"
          >
            <Input placeholder="例如：前端工程师" size="large" />
          </Form.Item>

          <Form.Item label="PDF 简历">
            <Dragger
              multiple
              accept="application/pdf,.pdf"
              beforeUpload={() => false}
              fileList={files}
              onChange={({ fileList }) => setFiles(fileList.filter((file) => file.type === "application/pdf"))}
              disabled={processing}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">拖拽 PDF 到这里，或点击选择文件</p>
              <p className="ant-upload-hint">支持批量上传，处理过程会逐个读取、提取、评分并保存。</p>
            </Dragger>
          </Form.Item>
        </Form>

        <Space wrap>
          <Button type="primary" size="large" loading={processing} onClick={handleProcess}>
            开始筛选
          </Button>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            disabled={processing}
            onClick={() => {
              setFiles([]);
              setResults([]);
              form.resetFields();
            }}
          >
            重置
          </Button>
        </Space>

        {processing && (
          <Progress
            className="sectionGap"
            percent={Math.round((currentIndex / Math.max(files.length, 1)) * 100)}
            status="active"
          />
        )}
      </section>

      <section className="panel">
        <div className="sectionTitle">
          <h2>处理结果</h2>
          <span>{results.length} 条</span>
        </div>
        <Table
          rowKey={(record) => `${record.fileName}-${record.email}-${record.status}`}
          columns={columns}
          dataSource={results}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 8 }}
        />
      </section>
    </AppShell>
  );
}
