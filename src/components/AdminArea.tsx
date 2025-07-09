import { useState } from 'react';
import { useAdmin } from './AdminProvider';
import { useTranslate } from '@tolgee/react';

export const AdminArea = () => {
  const { t } = useTranslate();
  const { isAdmin, adminKey, setAdminKey, addOption, resetDb } = useAdmin();
  const [optionName, setOptionName] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isAdmin) {
    return null;
  }

  const handleAddOption = async () => {
    if (!optionName.trim()) {
      setMessage({
        text: t({
          key: 'admin-option-name-required',
          defaultValue: 'Option name is required'
        }),
        type: 'error'
      });
      return;
    }

    setIsAddingOption(true);
    setMessage(null);

    try {
      const success = await addOption(optionName);
      if (success) {
        setOptionName('');
        setMessage({
          text: t({
            key: 'admin-option-added',
            defaultValue: 'Option added successfully'
          }),
          type: 'success'
        });
      } else {
        setMessage({
          text: t({
            key: 'admin-option-add-failed',
            defaultValue: 'Failed to add option'
          }),
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding option:', error);
      setMessage({
        text: t({
          key: 'admin-option-add-error',
          defaultValue: 'Error adding option'
        }),
        type: 'error'
      });
    } finally {
      setIsAddingOption(false);
    }
  };

  const handleResetDb = async () => {
    const confirmed = window.confirm(
      t({
        key: 'admin-reset-confirm',
        defaultValue: 'Are you sure you want to reset the database? This action cannot be undone.'
      })
    );

    if (!confirmed) {
      return;
    }

    setIsResettingDb(true);
    setMessage(null);

    try {
      const success = await resetDb();
      if (success) {
        setMessage({
          text: t({
            key: 'admin-reset-success',
            defaultValue: 'Database reset successfully'
          }),
          type: 'success'
        });
      } else {
        setMessage({
          text: t({
            key: 'admin-reset-failed',
            defaultValue: 'Failed to reset database'
          }),
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      setMessage({
        text: t({
          key: 'admin-reset-error',
          defaultValue: 'Error resetting database'
        }),
        type: 'error'
      });
    } finally {
      setIsResettingDb(false);
    }
  };

  return (
    <div className="admin-area">
      <h2>
        {t({
          key: 'admin-area-title',
          defaultValue: 'Admin Area'
        })}
      </h2>

      <div className="admin-form">
        <div className="admin-form-group">
          <label htmlFor="admin-key">
            {t({
              key: 'admin-key-label',
              defaultValue: 'Admin Key'
            })}
          </label>
          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder={t({
              key: 'admin-key-placeholder',
              defaultValue: 'Enter admin key'
            })}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="option-name">
            {t({
              key: 'admin-option-name-label',
              defaultValue: 'Option Name'
            })}
          </label>
          <input
            id="option-name"
            type="text"
            value={optionName}
            onChange={(e) => setOptionName(e.target.value)}
            placeholder={t({
              key: 'admin-option-name-placeholder',
              defaultValue: 'Enter option name'
            })}
          />
        </div>

        <div className="admin-buttons">
          <button
            className="admin-button add-option"
            onClick={handleAddOption}
            disabled={isAddingOption || !adminKey}
          >
            {isAddingOption
              ? t({
                  key: 'admin-adding-option',
                  defaultValue: 'Adding...'
                })
              : t({
                  key: 'admin-add-option',
                  defaultValue: 'Add Option'
                })}
          </button>

          <button
            className="admin-button reset-db"
            onClick={handleResetDb}
            disabled={isResettingDb || !adminKey}
          >
            {isResettingDb
              ? t({
                  key: 'admin-resetting-db',
                  defaultValue: 'Resetting...'
                })
              : t({
                  key: 'admin-reset-db',
                  defaultValue: 'Reset DB'
                })}
          </button>
        </div>

        {message && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};