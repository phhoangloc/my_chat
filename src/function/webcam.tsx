

const myWebcam = (stream: MediaStream) => {
    let videoTrack = stream.getVideoTracks()[0];
    let audioTrack = stream.getAudioTracks()[0];

    // Lấy thông tin cần thiết từ các track
    let videoInfo = {
        id: videoTrack.id,
        constraints: videoTrack.getConstraints(),
        label: videoTrack.label,
        kind: videoTrack.kind,
    };

    let audioInfo = {
        id: audioTrack.id,
        constraints: audioTrack.getConstraints(),
        label: audioTrack.label,
        kind: audioTrack.kind,
    };

    // Đóng gói thông tin vào một đối tượng JSON
    let packagedData = {
        video: videoInfo,
        audio: audioInfo,
    };

    return JSON.stringify(packagedData)
}

const yourWebcam = async (data: any) => {

    // Trích xuất thông tin từ đối tượng JSON
    let videoInfo = data.video;
    let audioInfo = data.audio;

    // Tạo các MediaStreamTrack từ thông tin trích xuất
    let videoTrack = navigator.mediaDevices.getUserMedia({ video: videoInfo.constraints });
    let audioTrack = navigator.mediaDevices.getUserMedia({ audio: audioInfo.constraints });

    // const newStream = async(ste)
    const stream = async ([v, a]: [videoTrack: Promise<MediaStream>, audioTrack: Promise<MediaStream>]) => {
        // Tạo MediaStream mới từ các track đã được tạo
        let stream = new MediaStream([(await v).getVideoTracks()[0], (await a).getAudioTracks()[0]]);
        return stream
    }
    const newStream = await stream([videoTrack, audioTrack])
    return newStream
}


export { myWebcam, yourWebcam }