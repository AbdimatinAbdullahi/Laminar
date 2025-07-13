import axios from "axios"

export const uploadTOS3 = async (file) =>{
    const urlResponse = await axios.post("http://localhost:8008/presigned-url", {
        name: file.name,
        type: file.type
    })

    // backend with s3 url and file url

    const { url, fileURL} = urlResponse.data

    await axios.put(url, file, 
        {Headers: { "Content-Type" : file.type }}
    )

    return fileURL
}