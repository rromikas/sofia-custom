import { Frame, Loading, Button as DefaultButton } from "@shopify/polaris";
import { gql } from "apollo-boost";
import { useApolloClient } from "react-apollo";
import { useState } from "react";
import Button from "./Button";
import Check from "./Check";
import HelloIcon from "./HelloIcon";
import { importProducts } from "../functions/importProducts";

const Importer = ({ user }) => {
  const GET_ALL_PRODUCTS = gql`
    mutation {
      bulkOperationRunQuery(
        query: """
        {
          products {
            edges {
              node {
                id
                title
                description
                images {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                }
                priceRangeV2{
                  minVariantPrice{
                    amount
                    currencyCode
                  }
                  maxVariantPrice{
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        """
      ) {
        bulkOperation {
          id
          status
          url
          objectCount
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const GET_CURRNET_OPERATION = gql`
    {
      currentBulkOperation {
        id
        status
        errorCode
        createdAt
        completedAt
        objectCount
        fileSize
        url
        partialDataUrl
      }
    }
  `;

  const [loading, setLoading] = useState(false);
  const apoloClient = useApolloClient();
  const [done, setDone] = useState(false);

  const startImporting = async () => {
    setLoading(true);
    setDone(false);
    await apoloClient.mutate({ mutation: GET_ALL_PRODUCTS });
    const interval = setInterval(async () => {
      const { data } = await apoloClient.query({
        query: GET_CURRNET_OPERATION,
      });

      if (data?.currentBulkOperation?.status === "COMPLETED") {
        clearInterval(interval);
        try {
          const res = await fetch(data.currentBulkOperation.url).then((x) =>
            x.text()
          );

          const jsonString = "[" + res.replace(/\n/gm, ",").slice(0, -1) + "]";
          const productsJson = JSON.parse(jsonString);
          let products = [];
          productsJson.forEach((x) => {
            if (x.originalSrc) {
              products[products.length - 1].images = [
                ...products[products.length - 1].images,
                x.originalSrc,
              ];
            } else {
              products.push({ ...x, images: [] });
            }
          });
          await importProducts(
            JSON.stringify(products),
            user.company_id,
            user.access_token
          );
        } catch (er) {
          console.log(er);
        } finally {
          setLoading(false);
          setDone(true);
        }
      }
    }, 500);
  };

  return (
    <Frame>
      {loading && <Loading></Loading>}
      <div
        style={{ width: "100%", height: "100%", display: "flex", padding: 20 }}
      >
        {!user ? null : !loading && !done ? (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "capitalize",
              }}
            >
              <HelloIcon
                style={{ marginRight: 30, marginLeft: -20 }}
              ></HelloIcon>
              Hi, {user.username}
            </div>
            <div style={{ fontSize: 18, lineHeight: "30px", marginBottom: 30 }}>
              Import products to your Sofia account and start using them in your
              flows!
            </div>
            <Button
              onClick={() => {
                startImporting();
              }}
              style={{ width: 172, marginBottom: 20 }}
            >
              Import Products
            </Button>
            <div style={{ opacity: 0.6 }}>
              Already imported products will be updated
            </div>
          </div>
        ) : !done ? (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                marginBottom: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Importing products...
            </div>
          </div>
        ) : (
          <div
            style={{
              margin: "auto",
              maxWidth: 456,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Check></Check>
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                marginBottom: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "30px",
              }}
            >
              Products are imported!
            </div>
            <div style={{ fontSize: 18, marginBottom: 40 }}>
              Now you can add products to your Sofia flows
            </div>
            <DefaultButton
              onClick={() => {
                setDone(false);
                setLoading(false);
              }}
            >
              {`That's great`}
            </DefaultButton>
          </div>
        )}
      </div>
    </Frame>
  );
};

export default Importer;
