/**
 * @module modules/statistics/statistics.service
 * @description Service for handling blog statistics and analytics
 */

import Article from '../articles/article.model';
import User from '../users/user.model';

const statisticsService = {
  /**
   * 🧭 Overview Statistics
   * Includes total articles, total authors, total comments, and total tags
   */
  async getOverview() {
    const [totalArticles, totalAuthors, totalComments, tags] = await Promise.all([
      Article.countDocuments(),
      User.countDocuments({ role: { $in: ['writer', 'editor', 'admin'] } }),
      Article.aggregate([
        { $unwind: { path: '$comments', preserveNullAndEmptyArrays: true } },
        { $count: 'totalComments' },
      ]),
      Article.find({}, 'tags'),
    ]);

    // Flatten and deduplicate tags
    const uniqueTags = Array.from(new Set(tags.flatMap((a: any) => a.tags || [])));

    return {
      totalArticles,
      totalAuthors,
      totalComments: totalComments?.[0]?.totalComments || 0,
      totalTags: uniqueTags.length,
    };
  },

  /**
   * 📈 Articles Published per Month
   * Useful for line charts
   */
  async getArticlesPerMonth() {
    const results = await Article.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return results.map((r) => ({
      date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      count: r.count,
    }));
  },

  /**
   * 📊 Average Articles per Author
   */
  async getAverageArticlesPerAuthor() {
    const [totalArticles, totalAuthors] = await Promise.all([
      Article.countDocuments(),
      User.countDocuments({ role: { $in: ['writer', 'editor', 'admin'] } }),
    ]);

    const average = totalAuthors > 0 ? totalArticles / totalAuthors : 0;

    return {
      totalArticles,
      totalAuthors,
      averagePerAuthor: Number(average.toFixed(2)),
    };
  },

  /**
   * 🔥 Top 5 Most Viewed Articles
   */
  async getTopViewedArticles() {
    return await Article.find({}, 'title views coverImage createdAt')
      .sort({ views: -1 })
      .limit(5)
      .lean();
  },

  /**
   * 💬 Most Commented Articles
   */
  async getMostCommentedArticles() {
    const articles = await Article.aggregate([
      {
        $project: {
          title: 1,
          commentCount: { $size: { $ifNull: ['$comments', []] } },
          coverImage: 1,
          createdAt: 1,
        },
      },
      { $sort: { commentCount: -1 } },
      { $limit: 5 },
    ]);

    return articles;
  },

  /**
   * 🏷️ Top Tags (by usage across articles)
   */
  async getTopTags() {
    const articles = await Article.find({}, 'tags').lean();

    const tagCounts: Record<string, number> = {};
    for (const article of articles) {
      (article.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }

    // Sort by usage count (descending)
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return sortedTags;
  },

  /**
   * 🧑‍💻 Top Authors by Articles Published
   */
  async getTopAuthors() {
    const authors = await Article.aggregate([
      {
        $group: {
          _id: '$userId',
          articleCount: { $sum: 1 },
        },
      },
      { $sort: { articleCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 0,
          authorId: '$author._id',
          name: '$author.name',
          email: '$author.email',
          articleCount: 1,
        },
      },
    ]);

    return authors;
  },

  /**
   * 🕒 Average Publish Frequency (Articles per Author per Month)
   */
  async getAuthorFrequency() {
    const result = await Article.aggregate([
      {
        $group: {
          _id: {
            author: '$userId',
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          articlesCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.author',
          avgPerMonth: { $avg: '$articlesCount' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          authorId: '$author._id',
          name: '$author.name',
          avgPerMonth: { $round: ['$avgPerMonth', 2] },
        },
      },
      { $sort: { avgPerMonth: -1 } },
    ]);

    return result;
  },

  /**
   * 📅 Article Creation Trend per Author (Monthly)
   */
  async getAuthorTrends() {
    const trends = await Article.aggregate([
      {
        $group: {
          _id: {
            author: '$userId',
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          authorId: '$author._id',
          authorName: '$author.name',
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
        },
      },
      { $sort: { authorName: 1, year: 1, month: 1 } },
    ]);

    return trends;
  },
};

export default statisticsService;
