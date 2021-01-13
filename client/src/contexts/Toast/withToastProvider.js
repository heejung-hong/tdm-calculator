import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { createPortal } from "react-dom";
import ToastContext from "./ToastContext";
import Toast from "./Toast";

const useStyles = createUseStyles({
  root: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center"
  }
});

const generateUEID = () => {
  let first = (Math.random() * 46656) | 0;
  let second = (Math.random() * 46656) | 0;
  first = ("000" + first.toString(36)).slice(-3);
  second = ("000" + second.toString(36)).slice(-3);

  return first + second;
};

const withToastProvider = Component => {
  const WithToastProvider = props => {
    const classes = useStyles();
    const [toasts, setToasts] = useState([]);
    const add = (content, reference) => {
      let sidebarWidth = 0;
      if (reference) {
        sidebarWidth = reference.current.offsetWidth;
      }
      console.log(sidebarWidth);
      const id = generateUEID();
      setToasts([...toasts, { id, content, sidebarWidth }]);
    };

    const remove = id => setToasts(toasts.filter(t => t.id !== id));

    return (
      <ToastContext.Provider value={{ add, remove }}>
        <Component {...props} />
        {createPortal(
          <div className={classes.root}>
            {toasts.map(t => (
              <Toast
                key={t.id}
                remove={() => remove(t.id)}
                sidebarWidth={t.sidebarWidth}
              >
                {t.content}
              </Toast>
            ))}
          </div>,
          document.body
        )}
      </ToastContext.Provider>
    );
  };

  return WithToastProvider;
};

export default withToastProvider;
