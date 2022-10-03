import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faMicrophone,
  faPhone,
  faMicrophoneSlash,
  faVideoSlash,
  faUserPlus,
  faPaperPlane,
  faComment,
  faCommentSlash,
  faDesktop,
  faUser,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./Room.css";

const Container = styled.div`
  display: flex;
  height: 90vh;
  width: 100vw;
  flex-wrap: wrap;
  background-color: #202124;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [props.peer]);

  return <video ref={ref} autoPlay playsInline className={props.classn} />;
};

const Message = (props) => {
  return (
    <div className="amsg">
      <div style={{ fontSize: 14, fontWeight: "bold" }}>{props.by}</div>
      <div style={{ fontSize: 14 }}>{props.content}</div>
    </div>
  );
};

const Par = (props) => {
  return <div className="apar">{props.content}</div>;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;
  const [username, setUserName] = useState("");
  const [cam, setCam] = useState(true);
  const [mic, setMic] = useState(true);
  const [ScreenSharing, setScreenSharing] = useState(false);
  const msgEndRef = useRef();
  const [txt, settxt] = useState("");
  const [msgs, setmsgs] = useState([]);
  const [allparti, setallparti] = useState(["You"]);
  const [showchat, setshowchat] = useState(true);
  const [showparti, setshowparti] = useState(false);

  useEffect(() => {
    if (!props.location.state) {
      window.location.href = `/pre/${roomID}`;
    }
    socketRef.current = io.connect("/");
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        if (!props.location.state.mic) {
          userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
          setMic(false);
        }
        if (!props.location.state.cam) {
          userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
          setCam(false);
        }

        setUserName(props.location.state.username);

        socketRef.current.emit(
          "join room",
          roomID,
          props.location.state.username
        );
        socketRef.current.on("all users", (users, usernames) => {
          setallparti((parti) => [...parti, ...usernames]);
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({ peer, peerID: userID });
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          setallparti((parti) => [...parti, payload.username]);
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [
            ...users,
            {
              peerID: payload.callerID,
              peer,
            },
          ]);
        });
        socketRef.current.on("room full", () => {
          window.location.href = "/sorry";
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("new message", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) {
            setmsgs((msgs) => [
              ...msgs,
              {
                by: payload.by,
                content: payload.content,
              },
            ]);
          }
        });

        socketRef.current.on("user-left", (id, name) => {
          setallparti((parti) => parti.filter((p) => p !== name));
          const item = peersRef.current.find((p) => p.peerID === id);
          if (item) {
            item.peer.destroy();
          }
          const newpeers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = newpeers;
          setPeers(newpeers);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleCam = () => {
    const enabled = userVideo.current.srcObject.getVideoTracks()[0].enabled;

    if (enabled) {
      userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
    } else {
      userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
    }

    setCam((cam) => !cam);
  };
  const toggleMic = () => {
    const enabled = userVideo.current.srcObject.getAudioTracks()[0].enabled;

    if (enabled) {
      userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
    } else {
      userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
    }

    setMic((mic) => !mic);
  };

  let par = (
    <div
      className="icon"
      onClick={() => {
        setshowchat(false);
        setshowparti(false);
      }}
    >
      <FontAwesomeIcon icon={faUser} size="1x" color="white" />
    </div>
  );

  if (!showparti) {
    par = (
      <div
        className="icon"
        style={{ backgroundColor: "red" }}
        onClick={() => {
          setshowchat(false);
          setshowparti(true);
        }}
      >
        <FontAwesomeIcon icon={faUserSlash} size="1x" color="white" />
      </div>
    );
  }
  let com = (
    <div
      className="icon"
      onClick={() => {
        setshowchat(false);
        setshowparti(false);
      }}
    >
      <FontAwesomeIcon icon={faComment} size="1x" color="white" />
    </div>
  );

  if (!showchat) {
    com = (
      <div
        className="icon"
        style={{ backgroundColor: "red" }}
        onClick={() => {
          setshowchat(true);
          setshowparti(false);
        }}
      >
        <FontAwesomeIcon icon={faCommentSlash} size="1x" color="white" />
      </div>
    );
  }

  let vid = (
    <div className="icon" onClick={toggleCam}>
      <FontAwesomeIcon icon={faVideo} size="1x" color="white" />
    </div>
  );

  if (!cam) {
    vid = (
      <div
        className="icon"
        style={{ backgroundColor: "red" }}
        onClick={toggleCam}
      >
        <FontAwesomeIcon icon={faVideoSlash} size="1x" color="white" />
      </div>
    );
  }
  let m = (
    <div className="icon" onClick={toggleMic}>
      <FontAwesomeIcon icon={faMicrophone} size="1x" color="white" />
    </div>
  );

  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  if (!mic) {
    m = (
      <div
        className="icon"
        style={{ backgroundColor: "red" }}
        onClick={toggleMic}
      >
        <FontAwesomeIcon icon={faMicrophoneSlash} size="1x" color="white" />
      </div>
    );
  }

  const addUser = async () => {
    let email = prompt("Enter the Email ID of the person you want to invite");
    let url = window.location.href;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, url }),
    };
    const response = await fetch("/sendemail", requestOptions);
    const data = await response.json();

    console.log(data);
  };

  const leave = () => {
    userVideo.current.srcObject.getVideoTracks()[0].stop();
    if (!ScreenSharing) {
      userVideo.current.srcObject.getAudioTracks()[0].stop();
    }
    window.location.href = "/";
  };

  const handlechange = (e) => {
    settxt(e.target.value);
  };

  const sendMsg = () => {
    if (txt.trim() !== "") {
      setmsgs((msgs) => [
        ...msgs,
        {
          by: "You",
          content: txt,
        },
      ]);

      socketRef.current.emit("sending message", {
        by: username,
        content: txt,
      });

      settxt("");
    }
  };
  const sendMsg1 = (e) => {
    if (txt.trim() !== "" && e.key === "Enter") {
      setmsgs((msgs) => [
        ...msgs,
        {
          by: "You",
          content: txt,
        },
      ]);

      socketRef.current.emit("sending message", {
        by: username,
        content: txt,
      });

      settxt("");
    }
  };

  const length = peersRef.current.length;
  let classn = "";
  if (length === 0) {
    classn = "one";
  } else if (length === 1) {
    classn = "two";
  } else if (length === 2) {
    classn = "three";
  } else {
    classn = "four";
  }

  let allvideos = null;

  if (classn === "one") {
    if (ScreenSharing) {
      classn = "onewithsc";
    }
    allvideos = (
      <div className="allvideos">
        <div className="rowvid">
          <video
            ref={userVideo}
            autoPlay
            playsInline
            muted
            className={classn}
          />
        </div>
      </div>
    );
  } else if (classn === "two") {
    allvideos = (
      <div className="allvideos">
        <div className="rowvid">
          <video
            ref={userVideo}
            autoPlay
            playsInline
            muted
            className={classn}
          />
          <Video
            key={peersRef.current[0].peerID}
            peer={peersRef.current[0].peer}
            classn={classn}
          />
          ;
        </div>
      </div>
    );
  } else if (classn === "three") {
    allvideos = (
      <div className="allvideos">
        <div className="rowvid">
          <video ref={userVideo} autoPlay playsInline muted className={"two"} />
          <Video
            key={peersRef.current[0].peerID}
            peer={peersRef.current[0].peer}
            classn={"two"}
          />
          ;
        </div>
        <div className="rowvid">
          <Video
            key={peersRef.current[1].peerID}
            peer={peersRef.current[1].peer}
            classn={"two"}
          />
          ;
        </div>
      </div>
    );
  } else {
    allvideos = (
      <div className="allvideos">
        <div className="rowvid">
          <video ref={userVideo} autoPlay playsInline muted className={"two"} />
          <Video
            key={peersRef.current[0].peerID}
            peer={peersRef.current[0].peer}
            classn={"two"}
          />
          ;
        </div>
        <div className="rowvid">
          <Video
            key={peersRef.current[1].peerID}
            peer={peersRef.current[1].peer}
            classn={"two"}
          />
          ;
          <Video
            key={peersRef.current[2].peerID}
            peer={peersRef.current[2].peer}
            classn={"two"}
          />
          ;
        </div>
      </div>
    );
  }

  const toggleScreenShare = () => {
    if (!ScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          setScreenSharing(true);
          let screenShareTrack = stream.getVideoTracks()[0];
          userVideo.current.srcObject = stream;
          peerReplaceTrack(screenShareTrack);
          setPeers(peersRef.current);

          screenShareTrack.onended = () => {
            endScreenShare();
          };
        });
    } else {
      userVideo.current.srcObject.getVideoTracks()[0].stop();
      endScreenShare();
    }
  };

  const endScreenShare = () => {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        let newvidTrack = stream.getVideoTracks()[0];
        peerReplaceTrack(newvidTrack);
        userVideo.current.srcObject = stream;
        userVideo.current.srcObject.getVideoTracks()[0].enabled = cam;
        userVideo.current.srcObject.getAudioTracks()[0].enabled = mic;
        setScreenSharing(false);
        setPeers(peersRef.current);
      });
  };

  const peerReplaceTrack = (newTrack) => {
    if (peersRef.current) {
      peersRef.current.forEach((peer) => {
        let oldTrack = peer.peer.streams[0].getVideoTracks()[0];
        peer.peer.replaceTrack(oldTrack, newTrack, peer.peer.streams[0]);
      });
    }
  };

  return (
    <div>
      <Container>
        <div className="videos">{allvideos}</div>
        {showchat ? (
          <div className="chatbox">
            <div class="chatbtitle">In-Call Messages</div>
            <div className="chatbinfo">
              Messages can only be seen by people in the call and are deleted
              when the call ends.
            </div>
            <div className="allmessages" onScroll={() => {}}>
              {msgs.map((msg) => {
                return (
                  <Message
                    key={Math.random()}
                    by={msg.by}
                    content={msg.content}
                  />
                );
              })}
              <div ref={msgEndRef} />
            </div>
            <div className="chatbsend" onKeyDown={sendMsg1}>
              <textarea
                placeholder="Send a Message to everyone"
                value={txt}
                onChange={handlechange}
              ></textarea>
              <div style={{ cursor: "pointer" }} onClick={sendMsg}>
                <FontAwesomeIcon icon={faPaperPlane} size="1x" color="black" />
              </div>
            </div>
          </div>
        ) : null}
        {showparti ? (
          <div className="chatbox">
            <div class="chatbtitle">In-Call Participants</div>
            <div className="chatbinfo">
              Participants can only be seen by people in the call
            </div>
            <div className="allmessages">
              {allparti.map((p) => {
                return <Par key={Math.random()} content={p} />;
              })}
            </div>
          </div>
        ) : null}
      </Container>
      <div className="controls">
        {vid}
        {m}
        <div className="icon" onClick={addUser}>
          <FontAwesomeIcon icon={faUserPlus} size="1x" color="white" />
        </div>
        <div
          className="icon"
          style={{ backgroundColor: "red" }}
          onClick={leave}
        >
          <FontAwesomeIcon icon={faPhone} size="1x" color="white" />
        </div>
        {com}
        {par}
        <div className="icon" onClick={toggleScreenShare}>
          <FontAwesomeIcon icon={faDesktop} size="1x" color="white" />
        </div>
      </div>
    </div>
  );
};

export default Room;
