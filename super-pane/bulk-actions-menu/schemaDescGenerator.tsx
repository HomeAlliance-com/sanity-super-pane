import _client from 'part:@sanity/base/client';

let client = _client as import('@sanity/client').SanityClient;
client = client.withConfig({apiVersion: '2021-03-25'});

export const descGenerators = [
  {
    type: 'state',
    projection: `
      ...
    `,
    factory: async (document: any) => {
      return `Need all-home services in ${document['name']}, ${document['short_name'].toUpperCase()}? Trust Home Alliance! We do appliance, electrical, HVAC, and sewage repair services. So, call and book a service today!`;
    }
  },
  {
    type: 'city',
    projection: `
      ...
    `,
    factory: async (document: any) => {
      const ref = document?.state?._ref;
      const state = await client.fetch(`*[_type == "state" && _id == "${ref}"]{
        short_name
      }[0]`);

      return `Trust Home Alliance for high-quality appliance, electrical, HVAC, ductwork, and sewage services in ${document['name']}, ${state?.short_name?.toUpperCase()}. We guarantee durable results! Book us now!`
    }
  },
  {
    type: 'location',
    projection: `
      ...
    `,
    factory: async (document: any) => {
      const ref = document?.city?._ref;
      const city = await client.fetch(`*[_type == "city" && _id == "${ref}"]{
        name
      }[0]`);

      return `Home Alliance offers quality home services in ${document['name']}, ${city?.name}. Whether you need an appliance, ductwork, HVAC, sewer line, or electrical services`;
    }
  },
  {
    type: 'service',
    projection: `
      ...,
      category->{
        name,
        "slug": slug.current
      },
      location->{
        name,
        city->{
          name,
          state->{
            short_name
          }
        }
      }
    `,
    factory: async (document: any) => {
      const location = document['location'];
      const category = document['category'];

      switch (category?.slug) {
        case "appliance-repair": return `In need of comprehensive appliance repair services near me in ${location?.city?.name}, ${location?.city?.state?.short_name?.toUpperCase()}, that guarantees top-notch results? Home Alliance has got you covered!`;
        case "heating-and-air-conditioning": return `Are you looking for a superior, affordable HVAC service near me in ${location?.city?.name}, ${location?.city?.state?.short_name?.toUpperCase()}? Look no further! Home Alliance is a company you can trust for quality`;
        case "plumbing": return `Give your home plumbing system the best care with Home Alliance’s professional plumbing service near me in ${location?.city?.name}, ${location?.city?.state?.short_name?.toUpperCase()}. The best plumbing solutions in ${location?.city?.state?.short_name?.toUpperCase()}.`;
        case "electrical": return `Enjoy 100% satisfaction and perfectly working appliances with Home Alliance Electrical service near me in ${location?.city?.name}, ${location?.city?.state?.short_name?.toUpperCase()}. We always get things done right.`;
        default: return null;
      }
    }
  }
]

