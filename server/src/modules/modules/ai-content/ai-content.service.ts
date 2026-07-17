import openai from "../../config/openai";

export const generateProductContent =
async (payload: {
  name: string;
  category?: string;
  brand?: string;
  keywords?: string;
}) => {

const prompt = `
Generate ecommerce content.

Product Name: ${payload.name}
Category: ${payload.category || ""}
Brand: ${payload.brand || ""}
Keywords: ${payload.keywords || ""}

Return JSON only:

{
  "shortDescription":"",
  "description":"",
  "seoTitle":"",
  "seoDescription":"",
  "seoKeywords":"",
  "productTags":[],
  "searchTags":[],
  "hashtags":[]
}
`;

const response =
await openai.chat.completions.create({
model:"gpt-4o-mini",
messages:[
{
role:"user",
content:prompt
}
],
temperature:0.7
});

const content =
response.choices?.[0]?.message?.content;

if(!content){
throw new Error("AI returned empty content");
}

return content;
};
