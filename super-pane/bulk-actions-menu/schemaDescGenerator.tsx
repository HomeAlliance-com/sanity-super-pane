import _client from 'part:@sanity/base/client';

let client = _client as import('@sanity/client').SanityClient;
client = client.withConfig({apiVersion: '2021-03-25'});

export const descGenerators = [
  {
    type: 'state',
    factory: async (document: any) => {
      return `Need all-home services in ${document['name']}, ${document['short_name']}? Trust Home Alliance! We do appliance, electrical, HVAC, and sewage repair services. So, call and book a service today!`;
    }
  },
  {
    type: 'city',
    factory: async (document: any) => {
      const ref = document?.state?._ref;
      const state = await client.fetch(`*[_type == "state" && _id == "${ref}"]{
        short_name
      }[0]`);

      return `Trust Home Alliance for high-quality appliance, electrical, HVAC, ductwork, and sewage services in ${document['name']}, ${state?.short_name}. We guarantee durable results! Book us now!`
    }
  },
  {
    type: 'location',
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
    factory: async (document: any) => {
      const locRef = document?.location?._ref;
      const location = await client.fetch(`*[_type == "location" && _id == "${locRef}"]{
        name,
        is_main_for_city,
        city->{
          name,
          state->{
            short_name
          }
        }
      }[0]`);

      return location?.is_main_for_city ?
        `In need of comprehensive appliance repair services near me in ${location?.city?.name}, ${location?.city?.state?.short_name}, that guarantees top-notch results? Home Alliance has got you covered!`
        : document['description']
    }
  }
]

