import { createStyles, ScrollArea } from '@mantine/core';
import { ForwardedRef, forwardRef, ReactNode } from 'react';

const useStyles = createStyles((theme) => {
  const shadowGradientAlpha = theme.colorScheme === 'dark' ? 0.5 : 0.05;
  return {
    root: {
      flex: '1 1 100%',
      position: 'relative',
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: theme.spacing.sm,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity .15s ease',
      },
      '&::before': {
        zIndex: 3,
        left: 0,
        background: `linear-gradient(to right, ${theme.fn.rgba(theme.black, shadowGradientAlpha)}, ${theme.fn.rgba(
          theme.black,
          0
        )}), linear-gradient(to right, ${theme.fn.rgba(theme.black, shadowGradientAlpha)}, ${theme.fn.rgba(
          theme.black,
          0
        )} 30%)`,
      },
      '&::after': {
        zIndex: 2,
        right: 0,
        background: `linear-gradient(to left, ${theme.fn.rgba(theme.black, shadowGradientAlpha)}, ${theme.fn.rgba(
          theme.black,
          0
        )}), linear-gradient(to left, ${theme.fn.rgba(theme.black, shadowGradientAlpha)}, ${theme.fn.rgba(
          theme.black,
          0
        )} 30%)`,
      },
    },
    leftShadowVisible: {
      '&::before': {
        opacity: 1,
      },
    },
    rightShadowVisible: {
      '&::after': {
        opacity: 1,
      },
    },
    scrollbar: {
      '&[data-state="visible"]': { background: 'transparent' },
      'div::before': { pointerEvents: 'none' },
    },
    thumb: {
      zIndex: 3,
    },
  };
});

type DataTableScrollAreaProps = {
  leftShadowVisible: boolean;
  rightShadowVisible: boolean;
  headerHeight: number;
  onScrollPositionChange: () => void;
  children: ReactNode;
};

export default forwardRef(function DataTableScrollArea(
  { leftShadowVisible, rightShadowVisible, headerHeight, onScrollPositionChange, children }: DataTableScrollAreaProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { cx, classes } = useStyles();
  return (
    <ScrollArea
      viewportRef={ref}
      className={cx(classes.root, {
        [classes.leftShadowVisible]: leftShadowVisible,
        [classes.rightShadowVisible]: rightShadowVisible,
      })}
      classNames={{ scrollbar: classes.scrollbar, thumb: classes.thumb }}
      styles={{ scrollbar: { marginTop: headerHeight } }}
      onScrollPositionChange={onScrollPositionChange}
    >
      {children}
    </ScrollArea>
  );
}) as (props: DataTableScrollAreaProps & { ref: ForwardedRef<HTMLDivElement> }) => JSX.Element;
