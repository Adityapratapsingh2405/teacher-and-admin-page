import { useEffect, useState } from 'react';
import SubjectService, { SubjectSelectionResponse } from '../../services/subjectService';
import './CertiSettings.css';
import { objectFlip } from '@cloudinary/url-gen/internal/utils/objectFlip';

interface CertificateSettings {
    subjects: SubjectSetting[];
    points: Record<string, string[]> | string[];
}

interface SubjectSetting {
    classId: number;
    sessionId: number;
    subjectName: string;
    mainResult: boolean;
    gradeSheet: boolean;
}

const emptySettings: CertificateSettings = { subjects: [], points: {} };

//const getSettingsFileName = (schoolId: string) => `certi-settings-school-${schoolId}.json`;

const getSubjectKey = (subject: Pick<SubjectSetting, 'classId' | 'sessionId' | 'subjectName'>) =>
    `${subject.classId}:${subject.sessionId}:${subject.subjectName}`;

const classesFromSubjects = (subjectData: SubjectSelectionResponse[]) =>
    Array.from(new Map(subjectData.map(subject => [
        subject.classId,
        { classId: subject.classId, className: subject.className }
    ])).values());

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
            : settings.points && typeof settings.points === 'object'
                ? Object.fromEntries(Object.entries(settings.points).flatMap(([className, classPoints]) =>
                    Array.isArray(classPoints)
                        ? [[className, classPoints.filter((point): point is string => typeof point === 'string')]]
                        : []
                ))
                : {}
    };
};

export default function CertiSettings() {
    const [activeView, setActiveView] = useState<'subjects' | 'points'>('subjects');
    const [subjects, setSubjects] = useState<Record<string, SubjectSelectionResponse[]>>({});
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectSetting[]>([]);
    const [points, setPoints] = useState<Record<number, string[]>>({});
    //const [newPoints, setNewPoints] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const classes = classesFromSubjects(Object.values(subjects).flat());
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

                try {
                    const schoolId = localStorage.getItem('schoolId');
                    if (!schoolId) return;

                    let settingsResponse = await SubjectService.getNotes();

                    // const settings = normalizeSettings(settingsResponse);
                    // const loadedPoints: Record<string, string[]> = {};
                    // if (Array.isArray(settings.points)) {
                    //     classesFromSubjects(subjectData).forEach(({ classId }) => {
                    //         loadedPoints[classId] = [...settings.points as string[]];
                    //     });
                    // } else {
                    //     const classIdsByName = new Map<string, number[]>();
                    //     classesFromSubjects(subjectData).forEach(({ classId, className }) => {
                    //         classIdsByName.set(className, [...(classIdsByName.get(className) ?? []), classId]);
                    //     });
                    //     Object.entries(settings.points).forEach(([className, classPoints]) => {
                    //         classIdsByName.get(className)?.forEach(classId => {
                    //             loadedPoints[classId] = [...classPoints];
                    //         });
                    //     });
                    // }
                    // console.log("loadedPoints : " , loadedPoints)
                    if(settingsResponse!='no') {
                    if (!cancelled) setPoints(settingsResponse);
                    }
                } catch {
                    if (!cancelled) setError('Subjects loaded, but saved certificate points could not be fetched.');
                }
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

    const addPoint = (classId: number, point : string) => {
        if(point.length>0){
            setPoints(current => ({ ...current, [classId]: [...(current[classId] ?? []), point] }));
        }        
        //setPoints(current => ({ ...current, [classId]: [...(current[classId] ?? []), point] }));
        //setNewPoints(current => ({ ...current, [classId]: '' }));
        setMessage('');
    };

    const saveCertificatePoints = async () => {
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            setError('School ID is missing. Cannot save certificate points.');
            setMessage('');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');
       

        try {
            console.log("BEfoer Save : " , points)
            await SubjectService.saveNotes(points);
            setMessage('Certificate points saved successfully.');
            alert('Certificate points saved successfully.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Could not save certificate points.');
        } finally {
            setSaving(false);
        }
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

            <div className="certi-settings__actions" role="group" aria-label="Certificate settings view">
                <button
                    type="button"
                    className={`certi-settings__button ${activeView === 'subjects' ? 'certi-settings__button--primary' : 'certi-settings__button--secondary'}`}
                    aria-pressed={activeView === 'subjects'}
                    onClick={() => setActiveView('subjects')}
                >
                    Subject selection
                </button>
                <button
                    type="button"
                    className={`certi-settings__button ${activeView === 'points' ? 'certi-settings__button--primary' : 'certi-settings__button--secondary'}`}
                    aria-pressed={activeView === 'points'}
                    onClick={() => setActiveView('points')}
                >
                    Certificate points
                </button>
            </div>

            {activeView === 'subjects' ? (
                <SubjectSelection
                    subjects={subjects}
                    selectedSubjects={selectedSubjects}
                    loading={loading}
                    saving={saving}
                    isClassSelected={isClassSelected}
                    onToggleSubject={toggleSubject}
                    onToggleClassSubjects={toggleClassSubjects}
                    onSave={exportSelectedSubjects}
                />
            ) : (
                <ClassPoints
                    classes={classes}
                    points={points}
                    saving={saving}                  
                    onAddPoint={addPoint}
                    onSave={saveCertificatePoints}
                    onRemovePoint={(classId, index) => setPoints(current => ({
                        ...current,
                        [classId]: (current[classId] ?? []).filter((_, pointIndex) => pointIndex !== index)
                    }))}
                />
            )}
        </main>
    );
}

interface SubjectSelectionProps {
    subjects: Record<string, SubjectSelectionResponse[]>;
    selectedSubjects: SubjectSetting[];
    loading: boolean;
    saving: boolean;
    isClassSelected: (classSubjects: SubjectSelectionResponse[], target: 'mainResult' | 'gradeSheet') => boolean;
    onToggleSubject: (subject: SubjectSelectionResponse, target: 'mainResult' | 'gradeSheet') => void;
    onToggleClassSubjects: (classSubjects: SubjectSelectionResponse[], target: 'mainResult' | 'gradeSheet', enabled: boolean) => void;
    onSave: () => void;
}

function SubjectSelection({ subjects, selectedSubjects, loading, saving, isClassSelected, onToggleSubject, onToggleClassSubjects, onSave }: SubjectSelectionProps) {
    const classNames = Object.keys(subjects);

    return (
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
            ) : classNames.length ? (
                <div className="certi-settings__subject-list">
                    {classNames.map(className => {
                        const classSubjects = subjects[className];
                        return <div className="certi-settings__class-group" key={className}>
                            <div className="certi-settings__class-heading">
                                <span className="certi-settings__class-kicker">CLASS</span>
                                <h3>{className}</h3>
                                <span className="certi-settings__class-count">{classSubjects.length} subjects</span>
                            </div>
                            <div className="certi-settings__class-subjects">
                                <div className="certi-settings__selection-title">
                                    <span>Subject</span>
                                    <div className="certi-settings__bulk-heading">
                                        <span>Main result sheet</span>
                                        <label className="certi-settings__bulk-choice">
                                            <input
                                                type="checkbox"
                                                checked={isClassSelected(classSubjects, 'mainResult')}
                                                onChange={event => onToggleClassSubjects(classSubjects, 'mainResult', event.target.checked)}
                                                aria-label={`Select all ${className} subjects for main result sheet`}
                                            />
                                            <span>Select all</span>
                                        </label>
                                    </div>
                                    <div className="certi-settings__bulk-heading">
                                        <span>Grade sheet</span>
                                        <label className="certi-settings__bulk-choice">
                                            <input
                                                type="checkbox"
                                                checked={isClassSelected(classSubjects, 'gradeSheet')}
                                                onChange={event => onToggleClassSubjects(classSubjects, 'gradeSheet', event.target.checked)}
                                                aria-label={`Select all ${className} subjects for grade sheet`}
                                            />
                                            <span>Select all</span>
                                        </label>
                                    </div>
                                </div>
                                {classSubjects.map(subject => {
                                    const subjectKey = getSubjectKey({
                                        classId: subject.classId,
                                        sessionId: subject.sessionId ?? 0,
                                        subjectName: subject.subjectName
                                    });
                                    const selection = selectedSubjects.find(item => getSubjectKey(item) === subjectKey);
                                    return <div className={`certi-settings__subject${selection ? ' certi-settings__subject--selected' : ''}`} key={subjectKey}>
                                        <span className="certi-settings__subject-name">{subject.subjectName}</span>
                                        <label className="certi-settings__choice" title="Include in main result sheet">
                                            <input
                                                type="checkbox"
                                                checked={selection?.mainResult === true}
                                                onChange={() => onToggleSubject(subject, 'mainResult')}
                                                aria-label={`${subject.subjectName}: main result sheet`}
                                            />
                                            <span className="certi-settings__choice-label">Main result</span>
                                        </label>
                                        <label className="certi-settings__choice" title="Include in grade sheet">
                                            <input
                                                type="checkbox"
                                                checked={selection?.gradeSheet === true}
                                                onChange={() => onToggleSubject(subject, 'gradeSheet')}
                                                aria-label={`${subject.subjectName}: grade sheet`}
                                            />
                                            <span className="certi-settings__choice-label">Grade sheet</span>
                                        </label>
                                    </div>;
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
                <button type="button" className="certi-settings__button certi-settings__button--primary" onClick={onSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Selected Subjects'}
                </button>
            </div>
        </section>
    );
}

interface ClassPointsProps {
    classes: { classId: number; className: string }[];
    points: Record<string, string[]>;  
    saving: boolean;   
    onAddPoint: (classId: number, id : string) => void;
    onSave: () => void;
    onRemovePoint: (classId: number, index: number) => void;
}

function ClassPoints({ classes, points, saving, onAddPoint, onSave, onRemovePoint }: ClassPointsProps) 
{
    const [newPoint,setNewPoint] = useState('');
    const totalPoints = Object.values(points).reduce((total, classPoints) => total + classPoints.length, 0);
    
    return (
        <section className="certi-settings__section" aria-labelledby="certi-points-heading">
            <div className="certi-settings__section-heading">
                <div>
                    <h2 id="certi-points-heading">Notes on the certificate</h2>
                    <p>Manage the points printed in the PDF notes section.</p>
                </div>
                <span className="certi-settings__count">{totalPoints} points</span>
            </div>

            {classes.length ? (
                <div className="certi-settings__point-groups">
                    {classes.map(({ classId, className }) => {
                        const classPoints = points[classId] ?? [];                       
                        return (
                            <div className="certi-settings__class-group certi-settings__point-group" key={classId}>
                                <div className="certi-settings__class-heading">
                                    <span className="certi-settings__class-kicker">CLASS</span>
                                    <h3>{className}</h3>
                                    <span className="certi-settings__class-count">{classPoints.length} points</span>
                                </div>
                                <div className="certi-settings__point-content" aria-label={`${className} certificate points`}>
                                        <button type="submit" className="certi-settings__button certi-settings__button--secondary" onClick={(e)=>{
                                            onAddPoint(classId, newPoint);
                                            }} >
                                            Add point
                                        </button> 
                                         <input
                                            type="text"                                              
                                            onChange={e=>setNewPoint(e.target.value)}
                                            className='form-control mt-3'
                                            placeholder={`Add a note for ${className}`}
                                            aria-label={`New certificate note for ${className}`}
                                        />
                                        

                                    {classPoints.length ? (
                                        <ol className="certi-settings__point-list">
                                            {classPoints.map((point, index) => (
                                                <li key={`${classId}-${point}-${index}`}>
                                                    <span>{point}</span>
                                                    <button
                                                        type="button"
                                                        className="certi-settings__remove"
                                                        aria-label={`Remove note from ${className}: ${point}`}
                                                        onClick={() => onRemovePoint(classId, index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="certi-settings__empty">No note points added for this class.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="certi-settings__empty">No note points added.</p>
            )}
            <div className="certi-settings__actions">
                <button
                    type="button"
                    className="certi-settings__button certi-settings__button--primary"
                    onClick={onSave}
                    disabled={saving || classes.length === 0}
                >
                    {saving ? 'Saving...' : 'Save Certificate Points'}
                </button>
            </div>
        </section>
    );
}