window.onload = () => {
  document.getElementById("my-button").onclick = init
}

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
  })
  const peer = createPeer()
  stream.getTracks().forEach((track) => peer.addTrack(track, stream))

  document.getElementById("my-button").onclick = () => {
    peer.close()
    stream.clone()
    document.getElementById("my-button").innerText = "Start Speaking"
    document.getElementById("my-button").onclick = init
  }
  document.getElementById("my-button").innerText = "Stop Speaking"
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org"
      }
    ]
  })
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer)

  return peer
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
    sdp: peer.localDescription
  }

  const { data } = await axios.post("/broadcast", payload)
  const desc = new RTCSessionDescription(data.sdp)
  peer.setRemoteDescription(desc).catch((e) => console.log(e))
}
