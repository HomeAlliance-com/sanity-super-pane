import { MdLocalMovies as icon } from 'react-icons/md';

export default {
  name: 'movie',
  title: 'Movie',
  type: 'document',
  icon,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 100,
      },
    },
    {
      name: 'overview',
      title: 'Overview',
      type: 'blockContent',
    },
    {
      name: 'meta_tags',
      title: 'Tested meta_tags',
      type: 'text',
    },
    {
      name: 'jsonld',
      title: 'Tested jsonld',
      type: 'text',
    },
    {
      name: 'releaseDate',
      title: 'Release date',
      type: 'datetime',
    },
    {
      name: 'externalId',
      title: 'External ID',
      type: 'number',
    },
    {
      name: 'popularity',
      title: 'Popularity',
      type: 'number',
    },
    {
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'castMembers',
      title: 'Cast Members',
      type: 'array',
      of: [{ type: 'castMember' }],
    },
    {
      name: 'crewMembers',
      title: 'Crew Members',
      type: 'array',
      of: [{ type: 'crewMember' }],
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'seoTitle',
          title: 'Seo Title',
          type: 'string',
        },
        {
          name: 'seoDescription',
          title: 'Seo Description',
          type: 'string',
        },
      ],
      preview: {
        select: {
          title: 'seoTitle',
          subtitle: 'seoDescription',
        },
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'releaseDate',
      media: 'poster',
      castName0: 'castMembers.0.person.name',
      castName1: 'castMembers.1.person.name',
    },
    prepare(selection) {
      const year = selection.date && selection.date.split('-')[0];
      const cast = [selection.castName0, selection.castName1]
        .filter(Boolean)
        .join(', ');

      return {
        title: `${selection.title} ${year ? `(${year})` : ''}`,
        date: selection.date,
        subtitle: cast,
        media: selection.media,
      };
    },
  },
};
