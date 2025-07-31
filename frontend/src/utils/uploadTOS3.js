import axios from "axios"

export const uploadTOS3 = async (file) =>{
    const urlResponse = await axios.get(`http://localhost:8008/generate-presigned-url?filename=${file.name}&filetype=${file.type}`)
    // backend with s3 url and file url
    const { upload_url, cfrURL} = urlResponse.data

    console.log("Cloud front url ", cfrURL)
    console.log("File Type or content tye: ", file.type)

    const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
            "Content-Type": file.type
        },
        body: file
        });

        if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Upload failed:", uploadRes.status, errorText);
        } else {
        console.log("Upload succeeded!");
        }

    return {upload_url, cfrURL}
}