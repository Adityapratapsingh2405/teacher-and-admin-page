import { useMemo, useState } from 'react';
import './TopperAnalysis.css';

type FilterKey = 'classes' | 'sections' | 'genders' | 'subjects';

interface TopperStudent {
	id: string;
	name: string;
	className: string;
	section: string;
	gender: 'Girl' | 'Boy';
	percentage: number;
	subjects: string[];
}

const filterOptions: Record<FilterKey, string[]> = {
	classes: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
	sections: ['Section A', 'Section B', 'Section C'],
	genders: ['Girl', 'Boy'],
	subjects: ['English', 'Mathematics', 'Science', 'Social Studies'],
};

const filterLabels: Record<FilterKey, string> = {
	classes: 'Class-wise',
	sections: 'Section-wise',
	genders: 'Gender-wise',
	subjects: 'Subject-wise',
};

const sampleStudents: TopperStudent[] = [
	{ id: 'ST-2048', name: 'Aarav Mehta', className: 'Class 10', section: 'Section A', gender: 'Boy', percentage: 98.4, subjects: ['Mathematics', 'Science', 'English'] },
	{ id: 'ST-1932', name: 'Ananya Shah', className: 'Class 10', section: 'Section B', gender: 'Girl', percentage: 97.8, subjects: ['English', 'Science', 'Social Studies'] },
	{ id: 'ST-2261', name: 'Diya Patel', className: 'Class 9', section: 'Section A', gender: 'Girl', percentage: 97.2, subjects: ['Mathematics', 'Science', 'English'] },
	{ id: 'ST-1875', name: 'Kabir Joshi', className: 'Class 12', section: 'Section C', gender: 'Boy', percentage: 96.9, subjects: ['Mathematics', 'Science'] },
	{ id: 'ST-2110', name: 'Myra Desai', className: 'Class 11', section: 'Section B', gender: 'Girl', percentage: 96.5, subjects: ['English', 'Social Studies'] },
	{ id: 'ST-1754', name: 'Reyansh Rao', className: 'Class 8', section: 'Section A', gender: 'Boy', percentage: 95.8, subjects: ['Mathematics', 'Science', 'Social Studies'] },
	{ id: 'ST-2316', name: 'Sara Khan', className: 'Class 9', section: 'Section C', gender: 'Girl', percentage: 95.4, subjects: ['English', 'Mathematics'] },
	{ id: 'ST-1993', name: 'Vivaan Shah', className: 'Class 11', section: 'Section A', gender: 'Boy', percentage: 94.7, subjects: ['Science', 'Social Studies'] },
];

const emptyFilters: Record<FilterKey, string[]> = {
	classes: [],
	sections: [],
	genders: [],
	subjects: [],
};

const TopperAnalysis: React.FC = () => {
	const [filters, setFilters] = useState(emptyFilters);
	const [search, setSearch] = useState('');
	const [topCount, setTopCount] = useState('5');
	const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
	const [appliedSearch, setAppliedSearch] = useState('');
	const [appliedTopCount, setAppliedTopCount] = useState('5');

	const filteredStudents = useMemo(() => sampleStudents.filter((student) => {
		const matchesClass = !appliedFilters.classes.length || appliedFilters.classes.includes(student.className);
		const matchesSection = !appliedFilters.sections.length || appliedFilters.sections.includes(student.section);
		const matchesGender = !appliedFilters.genders.length || appliedFilters.genders.includes(student.gender);
		const matchesSubject = !appliedFilters.subjects.length || appliedFilters.subjects.some((subject) => student.subjects.includes(subject));
		const matchesSearch = `${student.name} ${student.id}`.toLowerCase().includes(appliedSearch.trim().toLowerCase());
		return matchesClass && matchesSection && matchesGender && matchesSubject && matchesSearch;
	}).sort((first, second) => second.percentage - first.percentage)
		.slice(0, appliedTopCount === 'all' ? undefined : Number(appliedTopCount)), [appliedFilters, appliedSearch, appliedTopCount]);

	const selectedCount = Object.values(filters).reduce((count, values) => count + values.length, 0);
	const appliedFilterCount = Object.values(appliedFilters).reduce((count, values) => count + values.length, 0);
	const applySearch = () => {
		setAppliedFilters({
			classes: [...filters.classes],
			sections: [...filters.sections],
			genders: [...filters.genders],
			subjects: [...filters.subjects],
		});
		setAppliedSearch(search);
		setAppliedTopCount(topCount);
	};
	const averageScore = filteredStudents.length
		? (filteredStudents.reduce((total, student) => total + student.percentage, 0) / filteredStudents.length).toFixed(1)
		: '0.0';

	const toggleOption = (key: FilterKey, value: string) => {
		setFilters((current) => ({
			...current,
			[key]: current[key].includes(value)
				? current[key].filter((item) => item !== value)
				: [...current[key], value],
		}));
	};

	return (
		<main className="topper-analysis">
			<header className="topper-header">
				<div>
					<p className="topper-eyebrow">ACADEMIC PERFORMANCE</p>
					<h1>Topper Students</h1>
					<p className="topper-subtitle">Track and compare high-performing students across your school.</p>
				</div>
				<span className="topper-data-note"><span aria-hidden="true" /> Preview data</span>
			</header>

			<section className="topper-filters" aria-labelledby="topper-filter-title">
				<div className="topper-filter-heading">
					<div>
						<h2 id="topper-filter-title">Refine students</h2>
						<p>Choose any combination, then search to update the leaderboard.</p>
					</div>
						<button className="topper-reset" type="button" onClick={() => { setFilters(emptyFilters); setSearch(''); setTopCount('5'); }} disabled={!selectedCount && !search && topCount === '5'}>
						Reset filters
					</button>
				</div>

				<div className="topper-filter-grid">
					{(Object.keys(filterOptions) as FilterKey[]).map((key) => (
						<details className="topper-filter" key={key}>
							<summary>
								<span className="topper-filter-label">{filterLabels[key]}</span>
								<span className="topper-filter-value">{filters[key].length ? `${filters[key].length} selected` : 'All'}</span>
								<span className="topper-chevron" aria-hidden="true" />
							</summary>
							<div className="topper-filter-menu">
								{filterOptions[key].map((option) => (
									<label className="topper-option" key={option}>
										<input
											type="checkbox"
											checked={filters[key].includes(option)}
											onChange={() => toggleOption(key, option)}
										/>
										<span>{option}</span>
									</label>
								))}
							</div>
						</details>
					))}
				</div>

				{selectedCount > 0 && (
					<div className="topper-selected" aria-label="Selected filters">
						<span className="topper-selected-label">SELECTED</span>
						{(Object.keys(filters) as FilterKey[]).flatMap((key) => filters[key].map((value) => (
							<button className="topper-chip" key={`${key}-${value}`} type="button" onClick={() => toggleOption(key, value)} aria-label={`Remove ${value} filter`}>
								{value}<span aria-hidden="true">×</span>
							</button>
						)))}
					</div>
				)}
			</section>

			<section className="topper-results" aria-labelledby="topper-results-title">
				<div className="topper-results-topline">
					<div>
						<p className="topper-eyebrow">LEADERBOARD</p>
						<h2 id="topper-results-title">Student rankings</h2>
					</div>
					<div className="topper-tools">
						<label className="topper-count">
							<span>Show top</span>
							<select aria-label="Number of top students to show" value={topCount} onChange={(event) => setTopCount(event.target.value)}>
								<option value="3">3</option>
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="25">25</option>
								<option value="all">All</option>
							</select>
						</label>
						<label className="topper-search">
							<span className="topper-search-icon" aria-hidden="true" />
							<span className="sr-only">Search students</span>
							<input type="search" placeholder="Search name or ID" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applySearch(); } }} />
						</label>
						<button className="topper-search-button" type="button" onClick={applySearch}>
							<span className="topper-search-button-icon" aria-hidden="true" />
							Search
						</button>
					</div>
				</div>

				<div className="topper-summary" aria-live="polite">
					<div><strong>{filteredStudents.length.toString().padStart(2, '0')}</strong><span>students shown</span></div>
					<div><strong>{averageScore}%</strong><span>average score</span></div>
					<div><strong>{appliedFilterCount.toString().padStart(2, '0')}</strong><span>filters active</span></div>
				</div>

				<div className="topper-table-wrap">
					<table className="topper-table">
						<thead>
							<tr>
								<th scope="col">Rank</th>
								<th scope="col">Student</th>
								<th scope="col">Class</th>
								<th scope="col">Section</th>
								<th scope="col">Gender</th>
								<th scope="col">Subjects</th>
								<th scope="col">Overall</th>
							</tr>
						</thead>
						<tbody>
							{filteredStudents.map((student, index) => (
								<tr key={student.id}>
									<td><span className={`topper-rank ${index < 3 ? 'topper-rank-leading' : ''}`}>{String(index + 1).padStart(2, '0')}</span></td>
									<td>
										<div className="topper-student-name">{student.name}</div>
										<div className="topper-student-id">{student.id}</div>
									</td>
									<td>{student.className.replace('Class ', '')}</td>
									<td>{student.section.replace('Section ', '')}</td>
									<td>{student.gender}</td>
									<td><div className="topper-subjects">{student.subjects.join(' · ')}</div></td>
									<td><span className="topper-score">{student.percentage.toFixed(1)}%</span></td>
								</tr>
							))}
							{!filteredStudents.length && (
								<tr><td className="topper-empty" colSpan={7}>No students match these filters. Try adjusting your selection.</td></tr>
							)}
						</tbody>
					</table>
				</div>
				<p className="topper-footnote">Showing local preview records. Student results are not connected to school data.</p>
			</section>
		</main>
	);
};

export default TopperAnalysis;