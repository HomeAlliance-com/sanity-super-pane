import _client from 'part:@sanity/base/client';
import imageUrlBuilder from '@sanity/image-url'

let client = _client as import('@sanity/client').SanityClient;
client = client.withConfig({apiVersion: '2021-03-25'});

const builder = imageUrlBuilder(client);
const urlFor = (source: any) => builder.image(source);

export const metaTagGenerator = (document: any) => {
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
    factory: async (document: any) => {
      const refs = document?.answers?.map((item: any) => `"${item._ref}"`) || [];
      const answers = await client.fetch(`*[_type == "answer" && _id in [${refs.join(", ")}]]{
        answer
      }`);
      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Question",
        "text": document['question'],
        "acceptedAnswer": answers?.map((item: any) => {
          return {
            "@type": "Answer",
            "text": item?.answer?.map((child: any) => child.children[0]?.text).join('\n') || ''
          };
        })
      }, null, '\t');
    }
  },
  {
    type: 'state',
    factory: async (document: any) => {
      const refs = document?.cities?.map((item: any) => `"${item._ref}"`) || [];
      const cities = await client.fetch(`*[_type == "city" && _id in [${refs.join(", ")}]]{
        name
      }`);


      const mainImage = document['pictures'] ? document['pictures'].map((image: any) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block: any) => block._type === 'imageContent')?.map((block: any) => {
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
        "containsPlace": cities?.map((item: any) => {
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
    factory: async (document: any) => {
      const mainImage = document['pictures'] ? document['pictures'].map((image: any) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block: any) => block._type === 'imageContent')?.map((block: any) => {
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
    factory: async (document: any) => {
      const mainImage = document['pictures'] ? document['pictures'].map((image: any) => {
        return {
          "@type": "ImageObject",
          "description": image?.description,
          "name": image?.title,
          "alternateName": image?.alt,
        }
      }) : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block: any) => block._type === 'imageContent')?.map((block: any) => {
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
    factory: async (document: any) => {
      const mainImage = document['logo'] ? [{
          "@type": "ImageObject",
          "description": document['logo']?.description,
          "name": document['logo']?.title,
          "alternateName": document['logo']?.alt,
        }] : [];
      const postImages = document['post_body'] ? document['post_body']?.filter((block: any) => block._type === 'imageContent')?.map((block: any) => {
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
    factory: async (document: any) => {
      const authorRef = document['author']?._ref || '';
      const author = await client.fetch(`*[_type == "author" && _id == "${authorRef}"]{
        name,
      }`);

      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://homealliance.com/blogs/${document['slug']?.current}`,
        },
        "headline": document['title'],
        "description": document['meta_description'],
        "image": document['mainImage'] ? urlFor(document['mainImage']).url() : "",
        "author": {
          "@type": "Organization",
          "name": author[0]?.name,
          "url": author[0]?.slug?.current,
        },
        "publisher": {
          "@type": "Organization",
          "name": "HomeAlliance"
        },
      }, null, '\t');
    }
  },
  {
    type: 'service',
    factory: async (document: any) => {
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
      const postImages = document['post_body'] ? document['post_body']?.filter((block: any) => block._type === 'imageContent')?.map((block: any) => {
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

