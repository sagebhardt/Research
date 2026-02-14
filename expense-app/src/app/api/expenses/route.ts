import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.merchant = { contains: search };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const date = formData.get("date") as string;
    const categoryId = formData.get("categoryId") as string;
    const merchant = formData.get("merchant") as string;
    const description = (formData.get("description") as string) || "";
    const receipt = formData.get("receipt") as File | null;

    if (!amount || !date || !categoryId || !merchant) {
      return NextResponse.json(
        { error: "Missing required fields: amount, date, categoryId, merchant" },
        { status: 400 }
      );
    }

    const expenseId = crypto.randomUUID();
    let receiptPath: string | null = null;

    if (receipt && receipt.size > 0) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        session.user.id,
        expenseId
      );
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await receipt.arrayBuffer());
      const filename = receipt.name;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      receiptPath = `/uploads/${session.user.id}/${expenseId}/${filename}`;
    }

    const expense = await prisma.expense.create({
      data: {
        id: expenseId,
        userId: session.user.id,
        amount,
        date: new Date(date),
        categoryId,
        merchant,
        description,
        receiptPath,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
