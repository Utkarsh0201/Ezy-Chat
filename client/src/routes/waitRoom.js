import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faMicrophone,
  faMicrophoneSlash,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import { GoogleLogin } from "react-google-login";
import "./waitRoom.css";
require('dotenv').config()

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = (props) => {
  const userVideo = useRef();
  const roomID = props.match.params.roomID;
  const name = props.location.state ? props.location.state.name : "User";
  const img = props.location.state
    ? props.location.state.img
    : "https://image.flaticon.com/icons/png/512/149/149071.png";
  const [username, setusername] = useState(name);
  const [userimg, setuserimg] = useState(img);
  const [allusers, setallusers] = useState(0);
  const [dis, setdis] = useState(true);
  const [cam, setCam] = useState(true);
  const [mic, setMic] = useState(true);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        setdis(false);
      });
  }, []);
  useEffect(() => {
    async function fetchData() {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomID }),
      };
      const response = await fetch("/getpeople", requestOptions);
      const data = await response.json();
      setallusers(data.number);
    }

    fetchData();
  }, []);

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

  let vid = (
    <div className="ic" onClick={toggleCam}>
      <FontAwesomeIcon icon={faVideo} size="2x" color="white" />
    </div>
  );

  if (!cam) {
    vid = (
      <div
        className="ic"
        style={{ backgroundColor: "red" }}
        onClick={toggleCam}
      >
        <FontAwesomeIcon icon={faVideoSlash} size="2x" color="white" />
      </div>
    );
  }
  let m = (
    <div className="ic" onClick={toggleMic}>
      <FontAwesomeIcon icon={faMicrophone} size="2x" color="white" />
    </div>
  );

  if (!mic) {
    m = (
      <div
        className="ic"
        style={{ backgroundColor: "red" }}
        onClick={toggleMic}
      >
        <FontAwesomeIcon icon={faMicrophoneSlash} size="2x" color="white" />
      </div>
    );
  }

  if (dis) {
    m = null;
    vid = null;
  }

  const join = () => {
    props.history.push(`/room/${roomID}`, {
      cam,
      mic,
      username,
    });
  };
  const toHome = () => {
    window.location.href = "/";
  };

  const responseGoogle = (response) => {
    const name = response.Ys.Ve;
    const img = response.profileObj.imageUrl;

    setuserimg(img);
    setusername(name);
  };

  let ans = "No one else is here yet";

  if (allusers > 0) {
    ans = "";
    if (allusers === 1) {
      ans = "1 person is in this call";
    } else {
      ans = allusers + " people are in this call";
    }
  }

  return (
    <div className="container">
      <div className="videocontbox">
        <div className="taskbar">
          <div className="logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2zfAREgkmbvcbWq8CfWYnRK1TIQ2PD3QKcg&usqp=CAU"
              alt="logo"
            />
          </div>
          <p className="title" onClick={toHome}>
            Ezy <span>Chat</span>
          </p>
          <div className="userDetails">
            <p className="username">{username}</p>
            <div className="userimg">
              <img src={userimg} alt="user pic" />
            </div>
          </div>
        </div>
        <div className="videobox">
          <video ref={userVideo} autoPlay playsInline muted className="one" />
        </div>
        <div className="contr">
          {vid}
          {m}
        </div>
      </div>
      <div className="joinbox">
        <p>Ready to Join?</p>
        <h4>{ans}</h4>
        <div className="btnBox">
          <div className="joinbtn" onClick={join}>
            Join Now
          </div>
          <div
            style={{
              padding: "10px",
              margin: "10px",
            }}
          >
            <GoogleLogin
              clientId="473889804939-kogm6iao0p44dedeo650vs98qavh3dmg.apps.googleusercontent.com"
              onSuccess={responseGoogle}
              isSignedIn={false}
              buttonText="Login"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
