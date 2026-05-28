"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Alert, App as AntdApp, Button, Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { hasSupabaseConfig, loadConfig } from "@/lib/config";
import { listTalentRecords } from "@/lib/supabase";
import type { TalentRecord } from "@/lib/types";

export default function HistoryPage() {
  const { message } = AntdApp.useApp();
  const config = useMemo(loadConfig, []);
  const [records, setRecords] = useState<TalentRecord[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredRecords = records.filter((record) => {
    const haystack = [
      record.name,
      record.phone,
      record.email,
      record.school,
      record.targetPosition,
      record.resumeScore,
      record.evaluation
    ].join(" ");
    return haystack.toLowerCase().includes(keyword.toLowerCase());
  });

  const columns: ColumnsType<TalentRecord> = [
    {
      title: "姓名",
      dataIndex: "name",
      width: 100,
      fixed: "left"
    },
    {
      title: "电话",
      dataIndex: "phone",
      width: 140
    },
    {
      title: "邮箱",
      dataIndex: "email",
      width: 190
    },
    {
      title: "学历",
      dataIndex: "education",
      width: 90
    },
    {
      title: "毕业学校",
      dataIndex: "school",
      width: 160
    },
    {
      title: "工作年限",
      dataIndex: "workYears",
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
      render: (score) => <Tag color={Number(score) >= 80 ? "green" : Number(score) >= 60 ? "gold" : "red"}>{score}</Tag>,
      sorter: (a, b) => Number(a.resumeScore) - Number(b.resumeScore)
    },
    {
      title: "总结评价",
      dataIndex: "evaluation",
      width: 320,
      ellipsis: true
    },
    {
      title: "保存时间",
      dataIndex: "createdAt",
      width: 180,
      render: (value) => (value ? new Date(value).toLocaleString() : "-")
    }
  ];

  async function loadRecords() {
    if (!hasSupabaseConfig(config)) {
      return;
    }

    setLoading(true);
    try {
      setRecords(await listTalentRecords(config));
    } catch (error) {
      message.error(error instanceof Error ? error.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  return (
    <AppShell activeKey="/history">
      <div className="pageHeader">
        <div>
          <h1>历史记录</h1>
        </div>
        <Space wrap>
          <Input.Search placeholder="搜索姓名、岗位、学校、评价" allowClear onSearch={setKeyword} onChange={(event) => setKeyword(event.target.value)} />
          <Button icon={<ReloadOutlined />} onClick={loadRecords} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {!hasSupabaseConfig(config) ? (
        <Alert showIcon type="warning" message="配置未完成" description="请先配置 Supabase 环境变量。" />
      ) : (
        <section className="panel">
          <Table
            rowKey={(record) => String(record.id || `${record.email}-${record.createdAt}`)}
            columns={columns}
            dataSource={filteredRecords}
            loading={loading}
            scroll={{ x: 1510 }}
            pagination={{ pageSize: 10 }}
          />
        </section>
      )}
    </AppShell>
  );
}
