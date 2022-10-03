import React from "react";
import { v1 as uuid } from "uuid";
import "./CreateRoom.css";

const CreateRoom = (props) => {
  function create(name, img) {
    const id = uuid();
    props.history.push(`/pre/${id}`, {
      name,
      img,
    });
  }

  const responseGoogle1 = (response) => {
    create("User", "https://image.flaticon.com/icons/png/512/149/149071.png");
  };

  return (
    <div className="container1">
      <div className="taskbar1">
        <div className="logo1">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2zfAREgkmbvcbWq8CfWYnRK1TIQ2PD3QKcg&usqp=CAU" alt="logo" />
        </div>
        <p className="title">
          Ezy <span>Chat</span>
        </p>
      </div>
      <div className="Welcome">
        <div className="info">
          Face Time Simplified.
          <div className="random">
            We re-engineered the service that we built for secure business
            meetings, Ezy Chat, to make it free and available for all.
          </div>
        </div>
        <div className="right">
          <div className="disp">
            <img src="https://www.payetteforward.com/wp-content/uploads/2019/05/what-is-video-calling.jpg" alt="feature"/>
          </div>
        </div>
      </div>
      <div className="btnCont">
        <div className="btn" onClick={responseGoogle1}>
          Create a Room Instantly
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
