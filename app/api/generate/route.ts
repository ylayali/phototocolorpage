import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Helper function to convert a file to a base64 string
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const name = formData.get("name") as string;
    const background = formData.get("background") as "mindful" | "plain";

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const imageBase64 = await fileToBase64(imageFile);

    let prompt = "";

    if (background === "mindful") {
      if (name) {
        prompt = `turn this photo into a line drawing suitable for a coloring page. place the result inside a white box with a black outline. just below the box write "${name}" in friendly white letters with black outlines suitable for a coloring page. ensure these objects as a group are centered both horizontally and vertically on top of an abstract mindful coloring page style background`;
      } else {
        prompt = `turn this photo into a line drawing suitable for a coloring page. place the result inside a white box with a black outline.  ensure these objects as a group are centered both horizontally and vertically on top of an abstract mindful coloring page style background`;
      }
    } else { // plain background
      if (name) {
        prompt = `turn this photo into a line drawing suitable for a coloring page. place the result inside a white box with a black outline. just below the box write "${name}" in friendly white letters with black outlines suitable for a coloring page. ensure these objects as a group are centered both horizontally and vertically on top of a plain white background`;
      } else {
        prompt = `turn this photo into a line drawing suitable for a coloring page. place the result as large as possible, whilst still looking elegant, centrally on a plain white background`;
      }
    }

    const input = {
      prompt: prompt,
      quality: "high",
      background: "auto",
      moderation: "auto",
      aspect_ratio: "2:3",
      input_images: [imageBase64],
      output_format: "png",
      openai_api_key: process.env.OPENAI_API_KEY,
      number_of_images: 1,
      output_compression: 90,
    };

    // Create a prediction and wait for it to complete
    const prediction = await replicate.predictions.create({
      version: "openai/gpt-image-1",
      input: input,
    });

    console.log("Initial prediction:", prediction);

    // Wait for the prediction to complete
    let completedPrediction = prediction;
    while (completedPrediction.status === "starting" || completedPrediction.status === "processing") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      completedPrediction = await replicate.predictions.get(completedPrediction.id);
      console.log("Prediction status:", completedPrediction.status);
    }

    console.log("Completed prediction:", completedPrediction);

    if (completedPrediction.status === "failed") {
      throw new Error("Image generation failed: " + (completedPrediction.error || "Unknown error"));
    }

    if (completedPrediction.status !== "succeeded") {
      throw new Error("Image generation did not complete successfully");
    }

    // Extract the image URL from the output
    const output = completedPrediction.output;
    console.log("Prediction output:", output);

    if (!Array.isArray(output) || output.length === 0) {
      throw new Error("No images generated.");
    }

    const imageUrl = output[0];
    console.log("Final imageUrl:", imageUrl);

    // Validate that we have a proper URL string
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error("Invalid image URL received from Replicate API.");
    }

    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
