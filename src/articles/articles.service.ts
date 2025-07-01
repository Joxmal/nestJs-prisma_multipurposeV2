import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, companyId: number) {
    const { title, content } = createArticleDto;

    const data = await this.prisma.article.create({
      data: {
        title,
        content,
        companyId,
      },
    });
    return data;
  }

  async findAll(companyId: number) {
    return this.prisma.article.findMany({
      where: { companyId },
    });
  }

  async findOne(id: number, companyId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id, companyId },
    });
    if (!article) {
      throw new NotFoundException(`Artículo con ID ${id} no encontrado.`);
    }
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    companyId: number,
  ) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id, companyId },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Artículo con ID ${id} no encontrado.`);
    }

    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async remove(id: number, companyId: number) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id, companyId },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Artículo con ID ${id} no encontrado.`);
    }

    await this.prisma.article.delete({
      where: { id },
    });
  }
}
