import { IconExpand, IconShrink } from "@arco-design/web-react/icon";
import { memo, useEffect, useState } from "react";
import { Button } from "@arco-design/web-react";
import styles from "./index.module.less";
import type { IDockviewHeaderActionsProps } from "dockview";

const RightControls = (props: IDockviewHeaderActionsProps) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(
    props.containerApi.hasMaximizedGroup()
  );

  useEffect(() => {
    const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
      setIsMaximized(props.containerApi.hasMaximizedGroup());
    });

    return () => {
      disposable.dispose();
    };
  }, [props.containerApi]);

  const onClick = () => {
    if (props.containerApi.hasMaximizedGroup()) {
      props.containerApi.exitMaximizedGroup();
    } else {
      props.activePanel?.api.maximize();
    }
  };

  return (
    <div className={styles.groupControl}>
      {isMaximized ? (
        <Button
          type="text"
          icon={<IconShrink onClick={onClick} className={styles.button} />}
        />
      ) : (
        <Button
          type="text"
          icon={<IconExpand onClick={onClick} className={styles.button} />}
        />
      )}
    </div>
  );
};

export default memo(RightControls);
