window.onload = () => {
  document.getElementById("my-button").onclick = init
}

async function init() {
  const peer = createPeer()
  //peer.addTransceiver("video", { direction: "recvonly" })
  peer.addTransceiver("audio", { direction: "recvonly" })
  document.getElementById("my-button").onclick = () => {
    peer.close()
    document.getElementById("my-button").innerText = "Start Listening"
    document.getElementById("my-button").onclick = init
  }
  document.getElementById("my-button").innerText = "Stop Listening"
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org"
      }
    ]
  })
  peer.ontrack = handleTrackEvent
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer)

  return peer
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
    sdp: peer.localDescription
  }

  const { data } = await axios.post("/consumer", payload)
  const desc = new RTCSessionDescription(data.sdp)
  peer.setRemoteDescription(desc).catch((e) => console.log(e))
}

function handleTrackEvent(e) {
  document.getElementById("audio").srcObject = e.streams[0]
}
