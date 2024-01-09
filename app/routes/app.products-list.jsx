
import { useLoaderData } from "@remix-run/react";
import { 
    Card,
    Text,
    Thumbnail,
    IndexTable,
    useIndexResourceState,
    List,
    Badge } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";


export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    try{

    const response = await admin.graphql(
    `#graphql
    query {
        products(first: 30) {
          edges {
            node {
              id
              title
              handle
              onlineStoreUrl
              onlineStorePreviewUrl
              status
              publicationCount
              featuredImage {
                url
              }
              resourcePublications(first: 10) {
                nodes {
                  isPublished
                  publication {
                    name
                    id
                  }
                }
              }
            }
          }
        }
      }`,
    );

    if(response.ok){
        const data = await response.json()

        const {
            data: {
                products: { edges }
            }
        } = data;

        return edges
    }

    return null

    } catch(err){
        console.log(err)
    }
}


const ProductsTable = () => {
    const products = useLoaderData();
    const {selectedResources, allResourcesSelected, handleSelectionChange} = useIndexResourceState(products);

    console.log(products, 'products')

    const rowMarkup = products.map(
        (
            {node},
            index,
        ) => { 

            const publicationNames = [node.resourcePublications.nodes.map(
                (publicationNode) => <List.Item>{publicationNode.publication.name}</List.Item>
            )
            ]
            
        return (
            <IndexTable.Row
            id={node.id}
            key={node.id}
            selected={selectedResources.includes(node.id)}
            position={index}
            >
            <IndexTable.Cell>
            {node.featuredImage && (
            <Thumbnail
            source={node.featuredImage.url}
            alt={node.featuredImage.altText}
            />
            ) || (
            <Thumbnail
            source="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=webp&v=1530129081"
            alt="product alt"
            />
            )}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                <a href={ node.onlineStorePreviewUrl } target="_blank">{node.title}</a>
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{node.publicationCount}</IndexTable.Cell>
            <IndexTable.Cell>
            <List gap="extraTight">
            {publicationNames}
            </List>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {node.status && node.status === 'Active' ? <Badge tone="success">{node.status}</Badge> : node.status ? <Badge>{node.status}</Badge> : null}
            </IndexTable.Cell>
            </IndexTable.Row>
        )
      }   
    );

      const resourceName = {
        singular: 'product',
        plural: 'products',
      };

  return (
   

    
    <Card>
        <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        selectedItemsCount={
            allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
            {title: ''},
            {title: 'Product Title'},
            {title: 'Channels Count'},
            {title: 'Active Sales Channels'},
            {title: 'Status'},
        ]}
        >
        {rowMarkup}
        </IndexTable>
    </Card>
    
  );
};

export default ProductsTable;