import React from "react";
import "./CreateRoom.css";

const Srry = (props) => {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="container1">
      <div className="taskbar1">
        <div className="logo1">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2zfAREgkmbvcbWq8CfWYnRK1TIQ2PD3QKcg&usqp=CAU"
            alt="logo"
          />
        </div>
        <p className="title" onClick={goHome}>
          Ezy <span>Chat</span>
        </p>
      </div>
      <div className="Welcome">
        <div className="info" style={{ animation: "none" }}>
          The Room is Full 😥
          <div className="random">
            It looks as if the Room you were trying to join is full. I know it
            has been really frustrating for you to be held up like this when you
            just want to get your job done. Please try rejoining after some
            time. Best Wishes and apologies galore :(
          </div>
        </div>
      </div>
      <div className="btnCont">
        <div className="btn" style={{ animation: "none" }} onClick={goHome}>
          Back to Home
        </div>
      </div>
    </div>
  );
};

export default Srry;
