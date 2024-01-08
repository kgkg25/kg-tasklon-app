
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";


export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    console.log(admin);

    try{

    const response = await admin.graphql(
        `#graphql
        {
            collections(first: 10){
                edges{
                    node{
                        id
                        handle
                        title
                        description
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    );

    if(response.ok){
        const data = await response.json()

        const {
            data: {
                collections: { edges }  
            }
        } = data;
        return edges
    }

    return null

    return null;

    } catch(err){
        console.log(err)
    }
}


const Collections = () => {
    const collections = useLoaderData()
    console.log(collections, 'collections')

  return (
  <Page>
    <Layout>
        <Layout.Section>
            <Card><h1>hello world</h1></Card>
        </Layout.Section>
        <Layout.Section>
            <Card>
                <List type="bullet" gap="loose">
                    {
                        collections.map((edge) => {
                            const {node: collection } = edge;
                            return (
                                <List.Item key={collection.id}>
                                    <h2>{collection.title}</h2>
                                    <h2>{collection.description}</h2>
                                </List.Item>
                            )
                        })
                    }
                </List>
            </Card>

        </Layout.Section>
    </Layout>
</Page>
  );
};

export default Collections;