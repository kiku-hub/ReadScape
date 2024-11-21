import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// URLのバリデーション用の関数
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url: string };

    // URLの検証
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid URL provided",
          },
        },
        { status: 400 },
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            message: `Failed to fetch: ${response.status}`,
            status: response.status,
          },
        },
        { status: response.status },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // メタデータの取得を改善
    const title =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content") ??
      $("title").text()?.trim() ??
      "";

    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="twitter:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      "";

    const image =
      $('meta[property="og:image"]').attr("content") ??
      $('meta[name="twitter:image"]').attr("content") ??
      $('meta[name="thumbnail"]').attr("content") ??
      "";

    // 空の値をフィルタリング
    const metadata = {
      title: title || url,
      description: description || "説明はありません",
      image: image || "",
    };

    // レスポンスヘッダーの設定
    return NextResponse.json(metadata, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching article info:", error);
    return NextResponse.json(
      {
        error: {
          message: "Failed to fetch article info",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 },
    );
  }
}

// レート制限やタイムアウトの設定
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
    responseLimit: false,
  },
};
