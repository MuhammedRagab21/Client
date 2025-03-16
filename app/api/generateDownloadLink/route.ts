import { NextResponse } from "next/server"
import AWS from "aws-sdk"

export async function GET() {
  // Check if all required environment variables are set
  const requiredEnvVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET_NAME"]

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
    return NextResponse.json(
      {
        error: "Server configuration error",
        details: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      },
      { status: 500 },
    )
  }

  try {
    // Configure AWS SDK with specific settings for reliability
    AWS.config.update({
      region: "ap-southeast-2",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 5000, // 5 second timeout
        connectTimeout: 5000, // 5 second timeout
      },
      maxRetries: 3, // Retry failed requests 3 times
      sslEnabled: true,
      s3ForcePathStyle: false,
    })

    console.log("AWS SDK configured with region: ap-southeast-2")

    // Create S3 service object with specific endpoint
    const s3 = new AWS.S3({
      endpoint: "https://s3.ap-southeast-2.amazonaws.com",
      signatureVersion: "v4",
    })

    const fileName = "social-media-empire-bundle.zip"
    const bucketName = process.env.AWS_S3_BUCKET_NAME!

    console.log(`Attempting to access bucket: ${bucketName} for file: ${fileName}`)

    // Generate the signed URL directly without checking bucket first
    try {
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: 3600, // URL expiration time (1 hour)
      }

      // Generate the signed URL
      const url = await s3.getSignedUrlPromise("getObject", params)
      console.log("Successfully generated signed URL")

      return NextResponse.json({ downloadLink: url })
    } catch (error) {
      console.error("Detailed S3 error:", JSON.stringify(error, null, 2))

      // Provide a fallback Google Drive link
      const fallbackLink = "https://drive.google.com/uc?export=download&id=1tnqO7Tw4XVm1asJdnIN3orQrB5rkkJy-"

      return NextResponse.json({
        downloadLink: fallbackLink,
        warning: "Using fallback link due to S3 access issues",
        error: error.message || "Unknown S3 error",
      })
    }
  } catch (err) {
    console.error("Error in AWS configuration:", err)

    // Provide a fallback Google Drive link
    const fallbackLink = "https://drive.google.com/uc?export=download&id=1tnqO7Tw4XVm1asJdnIN3orQrB5rkkJy-"

    return NextResponse.json({
      downloadLink: fallbackLink,
      warning: "Using fallback link due to AWS configuration issues",
      error: err.message || "Unknown error",
    })
  }
}

