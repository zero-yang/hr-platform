import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UploadPage from "../page";
import { App, message } from "antd";
import { processResumeFile } from "@/lib/workflow";

vi.mock("@/components/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>
}));

vi.mock("@/lib/config", () => ({
  hasRequiredConfig: vi.fn(() => true),
  loadConfig: vi.fn(() => ({
    supabaseUrl: "https://example.supabase.co",
    supabaseKey: "anon",
    deepseekModel: "deepseek-v4-flash"
  }))
}));

vi.mock("@/lib/workflow", () => ({
  processResumeFile: vi.fn()
}));

vi.mock("antd", () => {
  const staticMessageMock = {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  };
  const appMessageMock = {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  };

  return {
    Alert: () => null,
    Button: ({ children, loading, onClick }: { children: React.ReactNode; loading?: boolean; onClick?: () => void }) => (
      <button disabled={loading} onClick={onClick}>
        {children}
      </button>
    ),
    Progress: () => null,
    Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Table: ({ dataSource }: { dataSource: Array<{ fileName: string; error?: string }> }) => (
      <div>
        {dataSource.map((record) => (
          <div key={record.fileName}>{record.error}</div>
        ))}
      </div>
    ),
    Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Upload: {
      Dragger: ({ children, onChange }: { children: React.ReactNode; onChange: (event: { fileList: unknown[] }) => void }) => (
        <div>
          <button
            onClick={() =>
              onChange({
                fileList: [
                  {
                    type: "application/pdf",
                    originFileObj: new File(["pdf"], "resume.pdf", { type: "application/pdf" })
                  }
                ]
              })
            }
          >
            选择 PDF
          </button>
          {children}
        </div>
      )
    },
    App: {
      useApp: vi.fn(() => ({ message: appMessageMock }))
    },
    message: staticMessageMock
  };
});

vi.mock("@ant-design/icons", () => ({
  InboxOutlined: () => <span />,
  ReloadOutlined: () => <span />
}));

describe("UploadPage", () => {
  it("shows a visible error when resume processing fails before any request", async () => {
    vi.mocked(processResumeFile).mockResolvedValueOnce({
      fileName: "resume.pdf",
      status: "failed",
      error: "PDF 中没有读取到可用文本",
      name: "未提供",
      phone: "未提供",
      email: "未提供",
      education: "未提供",
      school: "未提供",
      workYears: "未提供",
      targetPosition: "未提供",
      resumeContent: "",
      resumeScore: "0",
      evaluation: "处理失败"
    });

    render(<UploadPage />);

    fireEvent.click(screen.getByText("选择 PDF"));
    fireEvent.click(screen.getByText("开始筛选"));

    await waitFor(() => {
      expect(App.useApp().message.error).toHaveBeenCalledWith("resume.pdf：PDF 中没有读取到可用文本");
    });
    expect(message.error).not.toHaveBeenCalled();
  });
});
