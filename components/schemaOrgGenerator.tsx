import _client from 'part:@sanity/base/client';
import imageUrlBuilder from '@sanity/image-url'

let client = _client as import('@sanity/client').SanityClient;
client = client.withConfig({apiVersion: '2021-03-25'});

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

export const metaTagGenerator = (document) => {
  const getImageObj = () => document.mainImage || document.pictures?.at(0) || document.image;
  const html = '<meta property="og:site_name" content="Home Alliance | <%- title %>"/>\n' +
    ' <meta property="og:type" content="website"/>\n' +
    ' <meta prefix="og: http://ogp.me/ns#" property="og:title" content="<%- title %>"/>\n' +
    ' <meta prefix="og: http://ogp.me/ns#" property="og:image" content="<%- mainImage %>"/>\n' +
    ' <meta prefix="og: http://ogp.me/ns#" property="og:url" content="<%- slug %>"/>\n' +
    ' <meta prefix="og: http://ogp.me/ns#" property="og:description" content="<%- metaDescription %>"/>\n' +
    ' <meta name="description" content="<%- metaDescription %>"/>\n' +
    ' <link rel="canonical" href="<%- slug %>"/>';
  const compiled = _.template(html);
  const image = getImageObj();
  return compiled({
    title: document.title || document.name|| document.question,
    mainImage: image ? urlFor(image).url() : '',
    slug: document?.slug?.current || document.short_name,
    metaDescription: document.meta_description,
  });
}

export const generators = [
  {
    type: 'question',
    factory: async (document) => {
      const refs = document?.answers?.map(item => `"${item._ref}"`) || [];
      const answers = await client.fetch(`*[_type == "answer" && _id in [${refs.join(", ")}]]{
        answer
      }`);
      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Question",
        "text": document['question'],
        "acceptedAnswer": answers?.map((item) => {
          return {
            "@type": "Answer",
            "text": item?.answer?.map((child) => child.children[0]?.text).join('\n') || ''
          };
        })
      }, null, '\t');
    }
  },
  {
    type: 'state',
    factory: async (document) => {
      const refs = document?.cities?.map(item => `"${item._ref}"`) || [];
      const cities = await client.fetch(`*[_type == "city" && _id in [${refs.join(", ")}]]{
        name
      }`);


      const mainImage = document['pictures'] ? document['pictures'].map((image) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "State",
        "name": document['name'],
        "alternateName": document['short_name'],
        "description": document['meta_description'],
        "image": [
          ...mainImage,
          ...postImages
        ],
        "containsPlace": cities?.map((item) => {
          return {
            "@type": "City",
            "name": item.name
          };
        })
      }, null, '\t');
    }
  },
  {
    type: 'city',
    factory: async (document) => {
      const mainImage = document['pictures'] ? document['pictures'].map((image) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "City",
        "name": document['name'],
        "description": document['meta_description'],
        "image": [
          ...mainImage,
          ...postImages
        ],
      }, null, '\t');
    }
  },
  {
    type: 'location',
    factory: async (document) => {
      const mainImage = document['pictures'] ? document['pictures'].map((image) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Place",
        "name": document['name'],
        "image": [
          ...mainImage,
          ...postImages
        ],
      }, null, '\t');
    }
  },
  {
    type: 'brand',
    factory: async (document) => {
      const mainImage = document['logo'] ? [{
          "@type": "ImageObject",
          "description": document['logo']?.description,
          "name": document['logo']?.title,
          "alternateName": document['logo']?.alt,
        }] : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Brand",
        "name": document['name'],
        "description": document['meta_description'],
        "logo": mainImage[0],
        "image": [
          ...mainImage,
          ...postImages
        ],
      }, null, '\t');
    }
  },
  {
    type: 'post',
    factory: async (document) => {
      const authorRef = document['author']?._ref || '';
      const author = await client.fetch(`*[_type == "author" && _id == "${authorRef}"]{
        name,
      }`);

      const mainImage = document['mainImage'] ? [{
        "@type": "ImageObject",
        "description": document['mainImage']?.description,
        "name": document['mainImage']?.title,
        "alternateName": document['mainImage']?.alt,
      }] : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "author": author[0]?.name,
        "name": document['title'],
        "description": document['meta_description'],
        "image": [
          ...mainImage,
          ...postImages
        ],
        "text": document['body']?.filter((block) => block._type === 'block')?.map((block) => block.children[0]?.text)?.join('\n'),
      }, null, '\t');
    }
  },
  {
    type: 'service',
    factory: async (document) => {
      const categoryRef = document['category']?._ref;
      const category = await client.fetch(`*[_type == "category" && _id == "${categoryRef}"]{
        name,
      }`);
      const brandRef = document['brand']?._ref;
      const brand = await client.fetch(`*[_type == "brand" && _id == "${brandRef}"]{
        name,
      }`);

      const mainImage = document['icon'] ? [{
        "@type": "ImageObject",
        "description": document['icon']?.description,
        "name": document['icon']?.title,
        "alternateName": document['icon']?.alt,
      }] : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block) => block._type === 'imageContent')?.map((block) => {
        return {
          "@type": "ImageObject",
          "description": block?.description,
          "name": block?.title,
          "alternateName": block?.alt,
        }
      }) : [];

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": document['name'],
        "description": document['meta_description'],
        "image": [
          ...mainImage,
          ...postImages],
        "category": category[0]?.name,
        "brand": brand[0]?.name,
      }, null, '\t');
    }
  }
]

