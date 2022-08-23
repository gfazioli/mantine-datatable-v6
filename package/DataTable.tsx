import { Box, createStyles, Table } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { differenceBy, get, lowerCase, uniqBy, upperFirst } from 'lodash';
import { Key, useEffect, useState } from 'react';
import { DataTableProps } from './DataTable.props';
import DataTableEmpty from './DataTableEmpty';
import DataTableFooter from './DataTableFooter';
import DataTableHeader from './DataTableHeader';
import DataTableLoader from './DataTableLoader';
import DataTableRow from './DataTableRow';
import DataTableRowMenu from './DataTableRowMenu';
import DataTableRowMenuItem from './DataTableRowMenuItem';
import DataTableScrollArea from './DataTableScrollArea';

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    tr: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },
  },
  tableWithVerticalBorders: {
    'th, td': {
      ':not(:first-of-type)': {
        borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
      },
    },
  },
  verticalAlignmentTop: {
    td: {
      verticalAlign: 'top',
    },
  },
  verticalAlignmentBottom: {
    td: {
      verticalAlign: 'bottom',
    },
  },
}));

export default function DataTable<T extends Record<string, unknown>>({
  withVerticalBorders,
  height = '100%',
  minHeight,
  verticalAlign,
  fetching,
  columns,
  idPropertyName = 'id',
  expandedColumnPropertyName,
  records,
  selectedRecords,
  onSelectedRecordsChange,
  sortStatus,
  onSortStatusChange,
  horizontalSpacing,
  page,
  onPageChange,
  totalRecords,
  recordsPerPage,
  paginationSize = 'sm',
  loaderSize,
  loaderVariant,
  loaderBackgroundBlur,
  loadingText = 'Loading…',
  noRecordsText = 'No records',
  striped,
  rowMenu,
  ...otherProps
}: DataTableProps<T>) {
  const {
    ref: scrollViewportRef,
    width: scrollViewportWidth,
    height: scrollViewportHeight,
  } = useElementSize<HTMLDivElement>();
  const { ref: headerRef, height: headerHeight } = useElementSize<HTMLTableSectionElement>();
  const { ref: tableRef, width: tableWidth, height: tableHeight } = useElementSize<HTMLTableElement>();
  const { ref: footerRef, height: footerHeight } = useElementSize<HTMLDivElement>();

  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [scrolledToBottom, setScrolledToBottom] = useState(true);
  const [scrolledToLeft, setScrolledToLeft] = useState(true);
  const [scrolledToRight, setScrolledToRight] = useState(true);

  const [activeRowMenuInfo, setActiveRowMenuInfo] = useState<{ top: number; left: number; record: T } | null>(null);
  useEffect(() => {
    if (fetching) setActiveRowMenuInfo(null);
  }, [fetching]);

  const onScrollPositionChange = () => {
    if (!fetching) setActiveRowMenuInfo(null);

    if (fetching || tableHeight <= scrollViewportHeight) {
      setScrolledToTop(true);
      setScrolledToBottom(true);
    } else {
      const y = scrollViewportRef.current.scrollTop;
      setScrolledToTop(y === 0);
      setScrolledToBottom(headerHeight * 2 + footerHeight + y >= scrollViewportHeight);
    }

    if (fetching || tableWidth === scrollViewportWidth) {
      setScrolledToLeft(true);
      setScrolledToRight(true);
    } else {
      const x = scrollViewportRef.current.scrollLeft;
      setScrolledToLeft(x === 0);
      setScrolledToRight(Math.round(tableWidth - x) === Math.round(scrollViewportWidth));
    }
  };

  useEffect(onScrollPositionChange, [
    fetching,
    footerHeight,
    headerHeight,
    scrollViewportHeight,
    scrollViewportWidth,
    scrollViewportRef,
    tableHeight,
    tableWidth,
  ]);

  const handlePageChange = (page: number) => {
    scrollViewportRef.current.scrollTo({ top: 0, left: 0 });
    onPageChange!(page);
  };

  const recordsLength = records?.length;
  const recordIds = records?.map((record) => get(record, idPropertyName));
  const selectedRecordIds = selectedRecords?.map((record) => get(record, idPropertyName));
  const hasRecordsAndSelectedRecords =
    recordIds !== undefined && selectedRecordIds !== undefined && selectedRecordIds.length > 0;
  const allRecordsSelected = hasRecordsAndSelectedRecords && recordIds.every((id) => selectedRecordIds.includes(id));
  const someRecordsSelected = hasRecordsAndSelectedRecords && recordIds.some((id) => selectedRecordIds.includes(id));

  const [lastSelectionChangeIndex, setLastSelectionChangeIndex] = useState<number | null>(null);

  const recordIdsString = recordIds?.join(':') || '';
  useEffect(() => {
    setLastSelectionChangeIndex(null);
  }, [recordIdsString]);

  const selectionVisibleAndNotScrolledToLeft = !!selectedRecords && !scrolledToLeft;

  const { classes, cx } = useStyles();

  return (
    <Box className={classes.root} sx={{ height, minHeight }}>
      <DataTableScrollArea
        leftShadowVisible={!(selectedRecords || scrolledToLeft)}
        rightShadowVisible={!scrolledToRight}
        ref={scrollViewportRef}
        headerHeight={headerHeight}
        onScrollPositionChange={onScrollPositionChange}
      >
        <Table
          ref={tableRef}
          horizontalSpacing={horizontalSpacing}
          className={cx({
            [classes.tableWithVerticalBorders]: withVerticalBorders,
            [classes.verticalAlignmentTop]: verticalAlign === 'top',
            [classes.verticalAlignmentBottom]: verticalAlign === 'bottom',
          })}
          striped={recordsLength ? striped : false}
          {...otherProps}
        >
          <DataTableHeader<T>
            ref={headerRef}
            columns={columns}
            expandedColumnPropertyName={expandedColumnPropertyName}
            sortStatus={sortStatus}
            onSortStatusChange={onSortStatusChange}
            selectionVisible={!!selectedRecords}
            selectionChecked={allRecordsSelected}
            selectionIndeterminate={someRecordsSelected && !allRecordsSelected}
            onSelectionChange={
              onSelectedRecordsChange
                ? () => {
                    onSelectedRecordsChange(
                      allRecordsSelected
                        ? selectedRecords.filter((record) => !recordIds.includes(get(record, idPropertyName)))
                        : uniqBy([...selectedRecords, ...records!], (record) => get(record, idPropertyName))
                    );
                  }
                : undefined
            }
            leftShadowVisible={selectionVisibleAndNotScrolledToLeft}
            bottomShadowVisible={!scrolledToTop}
          />
          <tbody>
            {recordsLength ? (
              records.map((record, recordIndex) => {
                const recordId = get(record, idPropertyName);
                const selected = selectedRecordIds?.includes(recordId) || false;
                return (
                  <DataTableRow<T>
                    key={recordId as Key}
                    record={record}
                    expandedColumnPropertyName={expandedColumnPropertyName}
                    columns={columns}
                    selectionVisible={!!selectedRecords}
                    selectionChecked={selected}
                    onSelectionChange={
                      onSelectedRecordsChange
                        ? (e) => {
                            if ((e.nativeEvent as PointerEvent).shiftKey && lastSelectionChangeIndex !== null) {
                              const recordsInterval = records.filter(
                                recordIndex > lastSelectionChangeIndex
                                  ? (_, index) => index >= lastSelectionChangeIndex && index <= recordIndex
                                  : (_, index) => index >= recordIndex && index <= lastSelectionChangeIndex
                              );
                              onSelectedRecordsChange(
                                selected
                                  ? differenceBy(selectedRecords, recordsInterval, (r) => get(r, idPropertyName))
                                  : uniqBy([...selectedRecords, ...recordsInterval], (r) => get(r, idPropertyName))
                              );
                            } else {
                              onSelectedRecordsChange(
                                selected
                                  ? selectedRecords.filter((record) => get(record, idPropertyName) !== recordId)
                                  : uniqBy([...selectedRecords, record], (record) => get(record, idPropertyName))
                              );
                            }
                            setLastSelectionChangeIndex(recordIndex);
                          }
                        : undefined
                    }
                    menu={
                      rowMenu
                        ? {
                            trigger: rowMenu.trigger || 'rightClick',
                            onShow: setActiveRowMenuInfo,
                          }
                        : undefined
                    }
                    menuVisible={activeRowMenuInfo ? get(activeRowMenuInfo.record, idPropertyName) === recordId : false}
                    leftShadowVisible={selectionVisibleAndNotScrolledToLeft}
                  />
                );
              })
            ) : (
              <tr>
                <td></td>
              </tr>
            )}
          </tbody>
        </Table>
      </DataTableScrollArea>
      {page && (
        <DataTableFooter
          ref={footerRef}
          horizontalSpacing={horizontalSpacing}
          loadingText={loadingText}
          fetching={fetching}
          page={page}
          onPageChange={handlePageChange}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          paginationSize={paginationSize}
          recordsLength={recordsLength}
          topShadowVisible={!scrolledToBottom}
        />
      )}
      <DataTableLoader
        pt={headerHeight}
        pb={footerHeight}
        fetching={fetching}
        loaderBackgroundBlur={loaderBackgroundBlur}
        loaderSize={loaderSize}
        loaderVariant={loaderVariant}
      />
      <DataTableEmpty pt={headerHeight} pb={footerHeight} text={noRecordsText} active={!fetching && !recordsLength} />
      {rowMenu &&
        activeRowMenuInfo &&
        !(typeof rowMenu.hidden === 'function' ? rowMenu.hidden(activeRowMenuInfo.record) : rowMenu.hidden) && (
          <DataTableRowMenu
            top={activeRowMenuInfo.top}
            left={activeRowMenuInfo.left}
            onDestroy={() => setActiveRowMenuInfo(null)}
          >
            {rowMenu.items.map(({ key, title, icon, color, hidden, disabled, onClick }) => {
              const { record } = activeRowMenuInfo;
              if (typeof hidden === 'function' ? hidden(record) : hidden) return null;
              const titleValue = title
                ? typeof title === 'function'
                  ? title(record)
                  : title
                : upperFirst(lowerCase(key));
              return (
                <DataTableRowMenuItem
                  key={key}
                  title={titleValue}
                  icon={typeof icon === 'function' ? icon(record) : icon}
                  color={typeof color === 'function' ? color(record) : color}
                  disabled={typeof disabled === 'function' ? disabled(record) : disabled}
                  onClick={() => {
                    setActiveRowMenuInfo(null);
                    onClick(record);
                  }}
                />
              );
            })}
          </DataTableRowMenu>
        )}
    </Box>
  );
}
