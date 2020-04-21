import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/shared/user.decorator';
import { async } from 'rxjs/internal/scheduler/async';

@Controller('api/ideas')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(private ideaService: IdeaService) { }

  private logData(options: any) {
    options.user && this.logger.log('USER ' + JSON.stringify(options.user));

    options.data && this.logger.log('DATA ' + JSON.stringify(options.data));

    options.id && this.logger.log('IDEA ' + JSON.stringify(options.id));
  }

  @Get('paginate')
  async index(@Query('page') page: number = 0, @Query('limit') limit: number = 10) {
    limit = limit > 100 ? 100 : limit;
    return await this.ideaService.paginate({ page, limit, route: 'http://localhost:4000/api/ideas/paginate' }, { relations: ['author', 'upvotes', 'downvotes', 'comments'] });
  }

  @Get()
  showAllIdea(@Query('page') page: number) {
    return this.ideaService.showAll(page);
  }

  @Get('newest')
  async showNewestIdeas(@Query('page') page: number) {
    console.log('Query: ', page);

    return await this.ideaService.showAll(page, true);
  }

  @Get('search')
  async showByIdea(@Query('term') search: string) {
    return await this.ideaService.showByIdea(1, search);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User('id') user, @Body() data: IdeaDTO) {
    this.logData({ user, data });
    return this.ideaService.create(user, data);
  }

  @Get(':id')
  readidea(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateIdea(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: Partial<IdeaDTO>,
    @User('id') user: string,
  ) {
    this.logData({ id, data, user });
    return this.ideaService.update(id, user, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyIdea(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User('id') user: string,
  ) {
    this.logData({ user, id });
    return this.ideaService.destroy(id, user);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.upvote(id, user);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  downvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.downvote(id, user);
  }

  @Post(':id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.bookmark(id, user);
  }

  @Delete(':id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.unbookmark(id, user);
  }
}
