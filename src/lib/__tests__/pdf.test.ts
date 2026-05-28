import { describe, expect, it, vi } from "vitest";
import { readPdfText } from "../pdf";

const getDocument = vi.fn(() => ({
  promise: Promise.resolve({
    numPages: 1,
    getPage: vi.fn(async () => ({
      getTextContent: vi.fn(async () => ({
        items: [{ str: "候选人简历内容" }]
      }))
    }))
  })
}));

vi.mock("pdfjs-dist/webpack.mjs", () => ({
  getDocument
}));

describe("readPdfText", () => {
  it("uses the bundler-aware pdf.js entry to avoid fake worker fallback imports", async () => {
    const file = {
      arrayBuffer: vi.fn(async () => new ArrayBuffer(3))
    } as unknown as File;

    await expect(readPdfText(file)).resolves.toBe("候选人简历内容");

    expect(getDocument).toHaveBeenCalledWith({
      data: expect.any(ArrayBuffer),
      cMapPacked: true,
      cMapUrl: "/pdfjs/cmaps/",
      standardFontDataUrl: "/pdfjs/standard_fonts/"
    });
  });

  it("removes pdf pagination artifacts and merges multiple pages as resume text", async () => {
    const getPage = vi.fn(async (pageNumber: number) => ({
      getTextContent: vi.fn(async () => ({
        items:
          pageNumber === 1
            ? [
                { str: "Page 1 of 2", hasEOL: true },
                { str: "张三", hasEOL: true },
                { str: "高级产品经理", hasEOL: true },
                { str: "1", hasEOL: true }
              ]
            : [
                { str: "第 2 页 / 共 2 页", hasEOL: true },
                { str: "负责医疗 AI 产品规划", hasEOL: true },
                { str: "PDF.js viewer", hasEOL: true },
                { str: "邮箱：zhangsan@example.com", hasEOL: true }
              ]
      }))
    }));

    getDocument.mockReturnValueOnce({
      promise: Promise.resolve({
        numPages: 2,
        getPage
      })
    });
    const file = {
      arrayBuffer: vi.fn(async () => new ArrayBuffer(3))
    } as unknown as File;

    await expect(readPdfText(file)).resolves.toBe("张三 高级产品经理 负责医疗 AI 产品规划 邮箱：zhangsan@example.com");
  });
});
