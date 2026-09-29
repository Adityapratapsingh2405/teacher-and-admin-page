import { useEffect, useState } from 'react';
import SubjectService, { SubjectSelectionResponse } from '../../services/subjectService';
import './CertiSettings.css';
import { objectFlip } from '@cloudinary/url-gen/internal/utils/objectFlip';

interface CertificateSettings {
    subjects: SubjectSetting[];
    points: string[];
}

interface SubjectSetting {
    classId: number;
    sessionId: number;
    subjectName: string;
    mainResult: boolean;
    gradeSheet: boolean;
}

const emptySettings: CertificateSettings = { subjects: [], points: [] };

const getSettingsFileName = (schoolId: string) => `certi-settings-school-${schoolId}.json`;

const getSubjectKey = (subject: Pick<SubjectSetting, 'classId' | 'sessionId' | 'subjectName'>) =>
    `${subject.classId}:${subject.sessionId}:${subject.subjectName}`;

const normalizeSettings = (value: unknown): CertificateSettings => {
    if (!value || typeof value !== 'object') return emptySettings;

    const settings = value as Partial<CertificateSettings>;
    return {
        subjects: Array.isArray(settings.subjects)
            ? settings.subjects.flatMap(subject => {
                if (typeof subject === 'string') {
                    return [{ classId: 0, sessionId: 0, subjectName: subject, mainResult: true, gradeSheet: false }];
                }
                if (!subject || typeof subject !== 'object' || typeof subject.subjectName !== 'string') return [];
                return [{
                    classId: typeof subject.classId === 'number' ? subject.classId : 0,
                    sessionId: typeof subject.sessionId === 'number' ? subject.sessionId : 0,
                    subjectName: subject.subjectName,
                    mainResult: subject.mainResult === true,
                    gradeSheet: subject.mainResult === true ? false : subject.gradeSheet === true
                }];
            })
            : [],
        points: Array.isArray(settings.points)
            ? settings.points.filter((point): point is string => typeof point === 'string')
            : []
    };
};

export default function CertiSettings() {
    const [subjects, setSubjects] = useState<Record<string, SubjectSelectionResponse[]>>({});
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectSetting[]>([]);
    const [points, setPoints] = useState<string[]>([]);
    const [newPoint, setNewPoint] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const grouped = (subjectData: SubjectSelectionResponse[]) => {
        const groupedData = subjectData.reduce((grouped, subject) => {
            if (!grouped[subject.className]) {
                grouped[subject.className] = [];
            }

            const setting = selectedSubjects.find(ob=>ob.classId==subject.classId && ob.subjectName==subject.subjectName);
            if(setting)
            {
                subject.isMain = setting.mainResult;
                subject.isGrade = setting.gradeSheet;
            }
            grouped[subject.className].push(subject);

            return grouped;
        }, {} as Record<string, SubjectSelectionResponse[]>);
        return groupedData;
    };

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            try {
                const schoolId = localStorage.getItem('schoolId');
                if (!schoolId) throw new Error('School ID is missing.');

                const schoolSettingsResponse = await SubjectService.listSelectedSubjects();
                //console.log(schoolSettingsResponse);
                //setSchoolSettingsResponse(schoolSettingsResponse)
                setSelectedSubjects(schoolSettingsResponse)
            } catch (loadError) {
                if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load certificate settings.');
            }

            try {
                let subjectData = await SubjectService.getAllSubjects();
                //console.log(subjectData)
                
                if (!cancelled) setSubjects(grouped(subjectData));
            } catch (err) {
                console.log(err)
                if (!cancelled) setError('Settings loaded, but available subjects could not be fetched.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadSettings();
        return () => { cancelled = true; };
    }, []);

    // const availableSubjectNames = useMemo(() => {
    //     return Array.from(new Set([
    //         ...subjects.map(subject => subject.subjectName),
    //         ...selectedSubjects
    //     ])).filter(Boolean).sort((first, second) => first.localeCompare(second));
    // }, [subjects, selectedSubjects]);

    const toggleSubject = (subject: SubjectSelectionResponse, target: 'mainResult' | 'gradeSheet') => {
        const subjectSetting = {
            classId: subject.classId,
            sessionId: subject.sessionId ?? 0,
            subjectName: subject.subjectName
        };
        const subjectKey = getSubjectKey(subjectSetting);

        setSelectedSubjects(current => {
            const existing = current.find(item => getSubjectKey(item) === subjectKey);
            const enabled = existing?.[target] !== true;
            const updated = current.filter(item => getSubjectKey(item) !== subjectKey);
            return enabled
                ? [...updated, {
                    ...subjectSetting,
                    mainResult: target === 'mainResult',
                    gradeSheet: target === 'gradeSheet'
                }]
                : updated;
        });
        setMessage('');
    };

    const isClassSelected = (classSubjects: SubjectSelectionResponse[], target: 'mainResult' | 'gradeSheet') =>
        classSubjects.length > 0 && classSubjects.every(subject => selectedSubjects.find(selection => getSubjectKey(selection) === getSubjectKey({
            classId: subject.classId,
            sessionId: subject.sessionId ?? 0,
            subjectName: subject.subjectName
        }))?.[target] === true);

    const toggleClassSubjects = (classSubjects: SubjectSelectionResponse[], target: 'mainResult' | 'gradeSheet', enabled: boolean) => {
        const classSubjectKeys = new Set(classSubjects.map(subject => getSubjectKey({
            classId: subject.classId,
            sessionId: subject.sessionId ?? 0,
            subjectName: subject.subjectName
        })));

        setSelectedSubjects(current => {
            const unchanged = current.filter(subject => !classSubjectKeys.has(getSubjectKey(subject)));

            if (!enabled) return unchanged;

            return [
                ...unchanged,
                ...classSubjects.map(subject => ({
                    classId: subject.classId,
                    sessionId: subject.sessionId ?? 0,
                    subjectName: subject.subjectName,
                    mainResult: target === 'mainResult',
                    gradeSheet: target === 'gradeSheet'
                }))
            ];
        });
        setMessage('');
    };

    const addPoint = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const point = newPoint.trim();
        if (!point) return;
        setPoints(current => [...current, point]);
        setNewPoint('');
        setMessage('');
    };

    const exportSelectedSubjects = async () => {
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            setError('School ID is missing. Cannot save certificate settings.');
            return;
        }

        // const allSubjects = Object.values(subjects).flat();
        // const unassignedSubjects = allSubjects.filter(subject => {
        //     const subjectKey = getSubjectKey({
        //         classId: subject.classId,
        //         sessionId: subject.sessionId ?? 0,
        //         subjectName: subject.subjectName
        //     });
        //     const selection = selectedSubjects.find(item => getSubjectKey(item) === subjectKey);
        //     return selection?.mainResult !== true && selection?.gradeSheet !== true;
        // });

        // if (unassignedSubjects.length > 0) {
        //     const subjectNames = unassignedSubjects.map(subject => `${subject.subjectName} (${subject.className})`);
        //     setError(`Please select Main result sheet or Grade sheet for every subject: ${subjectNames.join(', ')}`);
        //     setMessage('');
        //     return;
        // }

        setSaving(true);
        setError('');
        setMessage('');
        try {
            await SubjectService.saveSelectedSubjects(selectedSubjects);
            alert('Subject selections saved successfully.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Could not save subject selections.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="certi-settings">
            <header className="certi-settings__header">
                <div>
                    <p className="certi-settings__eyebrow">EXAMINATION</p>
                    <h1>Certificate settings</h1>
                </div>                
            </header>

            {(error || message) && (
                <p className={`certi-settings__notice${error ? ' certi-settings__notice--error' : ''}`} role="status">
                    {error || message}
                </p>
            )}

            <section className="certi-settings__section" aria-labelledby="certi-subjects-heading">
                <div className="certi-settings__section-heading">
                    <div>
                        <h2 id="certi-subjects-heading">Subjects in the marksheet</h2>
                        <p>Select the subjects to include in the exam certificate PDF.</p>
                    </div>
                    <b className="certi-settings__count text-danger">{selectedSubjects.length} assigned</b>
                </div>

                {loading ? (
                    <p className="certi-settings__empty">Loading subjects...</p>
                ) : Object.keys(subjects).length ? (
                    <div className="certi-settings__subject-list">
                        {Object.keys(subjects).map(key => {
                            const data = subjects[key];
                            return <div className="certi-settings__class-group" key={key}>
                                <div className="certi-settings__class-heading">
                                    <span className="certi-settings__class-kicker">CLASS</span>
                                    <h3>{key}</h3>
                                    <span className="certi-settings__class-count">{data.length} subjects</span>
                                </div>
                                <div className="certi-settings__class-subjects">
                                    <div className="certi-settings__selection-title">
                                        <span>Subject</span>
                                        <div className="certi-settings__bulk-heading">
                                            <span>Main result sheet</span>
                                            <label className="certi-settings__bulk-choice">
                                                <input
                                                    type="checkbox"
                                                    checked={isClassSelected(data, 'mainResult')}
                                                    onChange={event => toggleClassSubjects(data, 'mainResult', event.target.checked)}
                                                    aria-label={`Select all ${key} subjects for main result sheet`}
                                                />
                                                <span>Select all</span>
                                            </label>
                                        </div>
                                        <div className="certi-settings__bulk-heading">
                                            <span>Grade sheet</span>
                                            <label className="certi-settings__bulk-choice">
                                                <input
                                                    type="checkbox"
                                                    checked={isClassSelected(data, 'gradeSheet')}
                                                    onChange={event => toggleClassSubjects(data, 'gradeSheet', event.target.checked)}
                                                    aria-label={`Select all ${key} subjects for grade sheet`}
                                                />
                                                <span>Select all</span>
                                            </label>
                                        </div>
                                    </div>
                                    {data.map(ob => {
                                        const subjectKey = getSubjectKey({
                                            classId: ob.classId,
                                            sessionId: ob.sessionId ?? 0,
                                            subjectName: ob.subjectName
                                        });
                                        const selection = selectedSubjects.find(subject => getSubjectKey(subject) === subjectKey);
                                        const isMainResult = selection?.mainResult === true;
                                        const isGradeSheet = selection?.gradeSheet === true;
                                        return <div className={`certi-settings__subject${selection ? ' certi-settings__subject--selected' : ''}`} key={subjectKey}>
                                            <span className="certi-settings__subject-name">{ob.subjectName}</span>
                                            <label className="certi-settings__choice" title="Include in main result sheet">
                                                <input
                                                    type="checkbox"
                                                    checked={isMainResult}
                                                    onChange={() => toggleSubject(ob, 'mainResult')}
                                                    aria-label={`${ob.subjectName}: main result sheet`}
                                                />
                                                <span className="certi-settings__choice-label">Main result</span>
                                            </label>
                                            <label className="certi-settings__choice" title="Include in grade sheet">
                                                <input
                                                    type="checkbox"
                                                    checked={isGradeSheet}
                                                    onChange={() => toggleSubject(ob, 'gradeSheet')}
                                                    aria-label={`${ob.subjectName}: grade sheet`}
                                                />
                                                <span className="certi-settings__choice-label">Grade sheet</span>
                                            </label>
                                        </div>
                                    })}
                                </div>
                            </div>;
                        })}
                    </div>
                ) : (
                    <p className="certi-settings__empty">No subjects are available yet.</p>
                )}
                <p className="certi-settings__hint">No subjects selected means all subjects are included.</p>
                <div className="certi-settings__actions">
                    <button type="button" className="certi-settings__button certi-settings__button--primary" onClick={exportSelectedSubjects} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Selected Subjects'}
                    </button>
                </div>
            </section>

            <section className="certi-settings__section" aria-labelledby="certi-points-heading">
                <div className="certi-settings__section-heading">
                    <div>
                        <h2 id="certi-points-heading">Notes on the certificate</h2>
                        <p>Manage the points printed in the PDF notes section.</p>
                    </div>
                    <span className="certi-settings__count">{points.length} points</span>
                </div>

                <form className="certi-settings__add-point" onSubmit={addPoint}>
                    <input
                        type="text"
                        value={newPoint}
                        onChange={event => setNewPoint(event.target.value)}
                        placeholder="Add a note point"
                        aria-label="New note point"
                    />
                    <button type="submit" className="certi-settings__button certi-settings__button--secondary" disabled={!newPoint.trim()}>
                        Add point
                    </button>
                </form>

                {points.length ? (
                    <ol className="certi-settings__point-list">
                        {points.map((point, index) => (
                            <li key={`${point}-${index}`}>
                                <span>{point}</span>
                                <button
                                    type="button"
                                    className="certi-settings__remove"
                                    aria-label={`Remove note: ${point}`}
                                    onClick={() => setPoints(current => current.filter((_, pointIndex) => pointIndex !== index))}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="certi-settings__empty">No note points added.</p>
                )}
            </section>
        </main>
    );
}