import axios from "axios"

export const uploadTOS3 = async (file) =>{
    const urlResponse = await axios.post(`http://localhost:8008/generate-presigned-url?filename=${file.name}&filetype=${file.type}`)
    // backend with s3 url and file url
    const { upload_url, cfrURL} = urlResponse.data

    console.log("Upload url and front url received: ", upload_url, cfrURL)

    try {
        const uploadRes = await axios.put(upload_url, file, 
        {headers: { "Content-Type" : file.type }})
        console.log("Upload response: ", uploadRes)
    } catch (error) {
        console.log("Error while uploading to s3:", error)
        console.error("Axios error config:", error.config);
        console.error("Axios error request:", error.request);
        console.error("Axios error response:", error.response);

    }

    return upload_url, cfrURL
}