/* THIS PAGE: Handles the code for all tables in the app. */

import styles from '../styles/Table.module.css';
import { searchTableData, generateTableRow, sortTable, filterCompletedBatches } from '@/utils/tableHelper';
import { useCallback, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from './Button';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

export default function Table({ columns, tableData, isDelete, onDeleteClick, isEditable, onEditSave, Title, FilterButton, isBatch, isStudent }) {
	const [sortColumn, setSortColumn] = useState(columns[0].accessor);
	const [sortAsc, setSortAsc] = useState(true);
	const [editId, setEditId] = useState(null);
	const [editedBatch, setEditedBatch] = useState(null);
	const [data, setData] = useState(JSON.parse(JSON.stringify(tableData)));
	const orig = useRef(JSON.parse(JSON.stringify(tableData)));
	const inputClassName = styles.editableInput;
	const [showOriginal, setShowOriginal] = useState(false);
	const router = useRouter();
	const tableHeaderClassName = sortAsc ? styles.genericTableColumnHeaderAsc : styles.genericTableColumnHeaderDesc;
	const sortedData = useCallback(() => sortTable(sortColumn, data, sortAsc), [sortColumn, data, sortAsc]);

	/* STUDENTS PAGE:
	This allows rotation in code below if 
	URL is /students */
	const pathname = usePathname().toString();	// Use relative path, e.g., /students
	const studentspgurl = "/students";
	const isMatch = (pathname == studentspgurl);

	/* BATCHES PAGE */
	const showCompletedBatchesText = showOriginal? 'Show all batches' : 'Show only completed batches';

	async function saveHandler() {
		await onEditSave(editedBatch);
		setEditId(null);
		setEditedBatch(null);
	}

	function onEditClick(rowData) {
		setEditId(rowData.id);
		setEditedBatch(rowData);
	}

	function onCancelClick() {
		setEditId(null);
		setEditedBatch(null);
		setData(() => JSON.parse(JSON.stringify(orig.current)));
	}

	const changeHandler = (e) => {
		const { name, value } = e.target;
		setEditedBatch((prev) => {
			return {
				...prev,
				[name]: value,
			};
		});
		setData((prev) => {
			const found = prev.find((rowData) => rowData.id === editedBatch.id);
			found[name] = value;
			return prev;
		});
	};

	function deleteHandler(id) {
		const confirmDelete = confirm(`Are you sure you want to delete row with id ${id}`);
		if (!confirmDelete) {
			return;
		}
		onDeleteClick(id);
		setEditId(null);
		setEditedBatch(null);
	}

	function onShowCompletedBatchesClick() {
		filterCompletedBatches(setData, orig.current, showOriginal);
		setShowOriginal((prev) => !prev);
	}

	useEffect(() => {
		setData(tableData);
		orig.current = JSON.parse(JSON.stringify(tableData));
	}, [tableData]);

	return (
		<div className={styles.tableWrapper}>
			<div className={styles.genericTableHeader}>
				<h2>{Title}</h2>
				{FilterButton ? <Button onClick={() => onShowCompletedBatchesClick()} text={showCompletedBatchesText} isLight={false}/> : <></>}
				<input id="table-search" className={styles.tableSearch} onInput={(e) => searchTableData(setData, e.target.value, orig.current)} placeholder={`Search in ${Title}`}></input>
			</div>
			<table className={styles.genericTable} cellpadding="0" cellspacing="0">
				<thead>
					<tr>
						{columns.map((column) => {
							const width = column.width ?? 'auto';
							return (
								<th
									key={column.accessor}
									width={width}
									onClick={() => onClickHeader(sortColumn, setSortColumn, column.accessor, sortAsc, setSortAsc)}
								>
									{isMatch ?
										<div className={styles.rotatedth}>	
											<span className={styles.rotatedthlabel}>
												{column.name}
											</span>
											{displaySortIcon(sortColumn, column.accessor, sortAsc)}
										</div>
										:
										<div className={tableHeaderClassName}>
											{column.name}
											{displaySortIcon(sortColumn, column.accessor, sortAsc)}
										</div>
									}
								</th>
							);
						})}
						{/* {isDelete || isEditable? <th width={'6%'}>Actions</th> : <></>} */}
						{isDelete || isEditable? <th className={styles.actionscolheading} width={'8%'}>Actions</th> : <></>}
					</tr>
				</thead>
				<tbody>
					{sortedData().map((rowData, index) => {
						return (
							<tr key={index}>
								{generateTableRow(columns, rowData, editId, changeHandler, inputClassName)}
								{isDelete || isEditable ?
									<td> 
										{editId === rowData.id ? 
											<>
												<Image className={styles.actionItem} alt={'save edit'} src={'/icons/save-icon.svg'} height={20} width={20} onClick={() => saveHandler() } />
												<Image className={styles.actionItem} alt={'cancel edit'} src={'/icons/cancel-icon.svg'} height={20} width={20} onClick={() => onCancelClick()} />
											</>
										: <>
										{isDelete ? <Image className={styles.actionItem} alt={'delete row'} src={'/icons/delete-icon.svg'} height={20} width={20} onClick={() => deleteHandler(rowData.id)} /> : <></>}
										{isEditable ? <Image className={styles.actionItem} alt={'edit row'} src={'/icons/edit-icon.svg'} height={20} width={20} onClick={() => onEditClick(rowData)} />: <></>} </>}										
										{isBatch ? <Button text="Roster" onClick={() => {router.push("/batch/"+rowData.id);}} style={{'width': 'inherit'}}></Button>: <></>}
										{isStudent ? <Button text="Enrollment History" onClick={() => {router.push("/student/"+rowData.id);}}></Button>: <></>}
									</td>
								: <></>}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function onClickHeader(sortColumn, setSortColumn, accessor, sortAsc, setSortAsc) {
	if (sortColumn === accessor) {
		setSortAsc(!sortAsc);
	} else {
		setSortColumn(accessor);
		setSortAsc(true);
	}
}

function displaySortIcon(sortColumn, accessor, sortAsc) {
	if (sortColumn !== accessor) {
		return <></>;
	}
	if (sortAsc) {
		return <Image alt={'sort-ascending'} src={'/icons/sort-up-icon.svg'} height={16} width={16} />;
	}
	return <Image alt={'sort-descending'} src={'/icons/sort-down-icon.svg'} height={16} width={16} />;
}