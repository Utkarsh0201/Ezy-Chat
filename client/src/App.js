import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import waitRoom from "./routes/waitRoom";
import Room from "./routes/Room";
import Sorry from "./routes/Sorry";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/sorry" exact component={Sorry} />
        <Route path="/pre/:roomID" component={waitRoom} />
        <Route path="/room/:roomID" component={Room} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
