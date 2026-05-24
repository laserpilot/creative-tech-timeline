import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Legend, Cell } from 'recharts';
import { Info } from 'lucide-react';

const CreativeCodeTimeline = () => {
  const [data, setData] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearRange, setYearRange] = useState([1990, 2025]);
  const [showNoReleaseDate, setShowNoReleaseDate] = useState(false);
  const [chartHeight, setChartHeight] = useState(400); // Default height in pixels

  // Color palette for software types
  const colorPalette = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
    '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173'
  ];
  
  // Categories will be loaded from JSON data
  const [categories, setCategories] = useState({});
  
  // All release data now comes from JSON
  
  // No longer need to derive categories, they're directly assigned in the JSON

  useEffect(() => {
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      try {
        // Handle different date formats
        const parts = dateStr.trim().split(/[\s,]+/);
        let day, month, year;
        
        // Format: "24 Nov 2008" or "November 2008" or "2008"
        if (parts.length === 3) {
          day = parseInt(parts[0], 10);
          
          // Convert month name to number
          const monthNames = ["January", "February", "March", "April", "May", "June", 
                              "July", "August", "September", "October", "November", "December"];
          const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
          let monthIdx;
          if (parts[1].length <= 3) {
            monthIdx = shortMonthNames.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
          } else {
            monthIdx = monthNames.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
          }
          
          month = monthIdx !== -1 ? monthIdx : 0;
          year = parseInt(parts[2], 10);
        } else if (parts.length === 2) {
          day = 1;
          const monthNames = ["January", "February", "March", "April", "May", "June", 
                              "July", "August", "September", "October", "November", "December"];
          const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
          let monthIdx;
          if (parts[0].length <= 3) {
            monthIdx = shortMonthNames.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
          } else {
            monthIdx = monthNames.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
          }
          
          month = monthIdx !== -1 ? monthIdx : 0;
          year = parseInt(parts[1], 10);
        } else if (parts.length === 1) {
          day = 1;
          month = 0;
          year = parseInt(parts[0], 10);
        } else {
          return null;
        }
        
        return new Date(year, month, day);
      } catch (e) {
        console.error("Error parsing date:", dateStr, e);
        return null;
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        let jsonData;
        
        try {
          // Fetch from the JSON file in public directory
          const response = await fetch('/creative-code-data.json');
          jsonData = await response.json();
        } catch (fetchError) {
          console.error("Error fetching JSON:", fetchError);
          setError("Could not load the JSON data file. Check if it exists in the public directory.");
          setLoading(false);
          return;
        }
        
        // Set categories from JSON data
        setCategories(jsonData.categories || {});
        
        const processedData = [];
        const toolSet = new Set();
        
        // Process the tools and their releases from JSON data
        if (jsonData.tools && Object.keys(jsonData.tools).length > 0) {
          Object.entries(jsonData.tools).forEach(([toolName, toolData]) => {
            toolSet.add(toolName);
            
            // Process each release for this tool
            if (toolData.releases && toolData.releases.length > 0) {
              toolData.releases.forEach((release, index) => {
                const parsedDate = parseDate(release.dateString);
                
                if (parsedDate) {
                  processedData.push({
                    id: `${toolName}-${index}`,
                    software: toolName,
                    version: release.version || '',
                    date: parsedDate,
                    dateString: release.dateString,
                    timestamp: parsedDate.getTime(),
                    notes: release.notes || '',
                    link: release.link || '',
                    category: toolData.category || 'other'
                  });
                }
              });
            }
          });
        } else {
          console.warn("No tools data found in JSON file");
          
          // Add dummy data if no data is loaded
          const dummyDate = new Date(2000, 0, 1);
          processedData.push({
            id: 'dummy-1',
            software: 'Sample Tool',
            version: '1.0',
            date: dummyDate,
            dateString: 'January 2000',
            timestamp: dummyDate.getTime(),
            notes: 'This is sample data. No real data was loaded.',
            link: '',
            category: 'programming'
          });
          toolSet.add('Sample Tool');
        }
        
        // Set data in state
        setData(processedData);
        setSoftwareList(Array.from(toolSet));
        setSelectedSoftware(Array.from(toolSet));
        setLoading(false);
      } catch (error) {
        console.error("Error loading JSON data:", error);
        setError("Failed to load JSON data file");
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Auto-adjust chart height when software selection changes
  useEffect(() => {
    if (selectedSoftware.length > 15) {
      // Only auto-adjust if more than 15 items are selected to avoid constant resizing
      const calculatedHeight = Math.max(400, Math.min(1200, selectedSoftware.length * 25 + 150));
      setChartHeight(calculatedHeight);
    }
  }, [selectedSoftware.length]);

  // Apply all filters to data
  const filteredData = data.filter(item => {
    // Filter by selected software
    const softwareMatch = selectedSoftware.includes(item.software);
    
    // Filter by category if a category is selected
    const categoryMatch = categoryFilter === 'all' || 
                         (item.category === categoryFilter);
    
    // Filter by year range
    const yearMatch = item.date && 
                     (item.date.getFullYear() >= yearRange[0] && 
                      item.date.getFullYear() <= yearRange[1]);
    
    return softwareMatch && categoryMatch && yearMatch;
  });
  
  // Get category from software name
  const getCategoryForSoftware = (software) => {
    const item = data.find(d => d.software === software);
    return item ? item.category : 'other';
  };

  const toggleSoftware = (software) => {
    setSelectedSoftware(prev => {
      if (prev.includes(software)) {
        return prev.filter(s => s !== software);
      } else {
        return [...prev, software];
      }
    });
  };

  const toggleAllSoftware = () => {
    if (selectedSoftware.length === softwareList.length) {
      setSelectedSoftware([]);
    } else {
      setSelectedSoftware([...softwareList]);
    }
  };
  
  // Select software by category
  const selectByCategory = (category) => {
    const softwareInCategory = data
      .filter(item => item.category === category)
      .map(item => item.software);
    
    const uniqueSoftware = [...new Set(softwareInCategory)];
    setSelectedSoftware(uniqueSoftware);
  };

  // Color by category or by software
  const getSoftwareColor = (software) => {
    const item = data.find(d => d.software === software);
    const category = item ? item.category : 'other';
    
    // Get color from categories object
    return categories[category]?.color || colorPalette[softwareList.indexOf(software) % colorPalette.length];
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Get the category's display name from categories data
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 max-w-xs">
          <h3 className="font-bold text-lg mb-1">{data.software}</h3>
          <p className="text-sm mb-1">Version: {data.version}</p>
          <p className="text-sm mb-1">Released: {data.dateString}</p>
          <p className="text-sm mb-1">Category: {categories[data.category]?.name || 'Other'}</p>
          {data.notes && <p className="text-sm mt-2">{data.notes}</p>}
          {data.link && (
            <div className="mt-2 text-xs">
              <a 
                href={data.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline"
              >
                Source/Reference
              </a>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // About modal content
  const AboutContent = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">About Creative Coding Timeline</h2>
        
        <p className="mb-4">This visualization combines data from two sources:</p>
        <ol className="list-decimal pl-6 mb-4">
          <li className="mb-2">Your CSV dataset of creative coding tool release dates</li>
          <li className="mb-2">Enhanced with additional data from Blair Neal's <a href="https://github.com/laserpilot/Creative_Tech_Taxonomy" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Creative Tech Taxonomy</a></li>
        </ol>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Categories from Creative Tech Taxonomy</h3>
        <p className="mb-4">The tools are categorized into these domains:</p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-blue-500"></span><strong>Programming Tools:</strong> Processing, OpenFrameworks, Cinder, vvvv, Unity, etc.</li>
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-orange-500"></span><strong>Creative Libraries:</strong> OpenCV, ARKit, TensorFlow, etc.</li>
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-green-500"></span><strong>Physical Computing:</strong> Arduino, Raspberry Pi, Teensy, etc.</li>
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-red-500"></span><strong>Audio-Visual:</strong> MaxMSP, Pure Data, Touch Designer, etc.</li>
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-purple-500"></span><strong>Data Visualization:</strong> D3.js, Observable, etc.</li>
          <li className="mb-1"><span className="inline-block w-3 h-3 mr-2 rounded-full bg-brown-500"></span><strong>Web-Based Tools:</strong> p5.js, Three.js, Paper.js, etc.</li>
        </ul>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Timeline Features</h3>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-1">Filter by software tool category</li>
          <li className="mb-1">View release patterns over time</li>
          <li className="mb-1">Compare development across different creative coding platforms</li>
          <li className="mb-1">Select specific year ranges</li>
        </ul>
        
        <p className="mb-4 italic">
          Note: This visualization is meant to provide a general overview of creative coding tools history. 
          Some dates may be approximate, especially for earlier software releases.
        </p>
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => setShowAbout(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="font-sans p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Creative Coding Timeline...</h1>
          <p>Please wait while we process the data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Timeline</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <p>Please check the console for more information or try refreshing the page.</p>
        </div>
      </div>
    );
  }
  
  // Check if we have data
  if (!data || data.length === 0) {
    return (
      <div className="font-sans p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="mb-4">No timeline data was found. Please make sure your CSV file is properly formatted and accessible.</p>
          <p>Check the console for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans p-2">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Creative Coding Tools Timeline</h1>
          <button 
            onClick={() => setShowAbout(true)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Info size={16} className="mr-1" /> About this visualization
          </button>
        </div>
        <p className="mb-4">Interactive visualization of {data.length} releases across {softwareList.length} creative coding platforms</p>
        
        <div className="flex flex-wrap mb-4 gap-2">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded ${viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Timeline View
          </button>
          <button 
            onClick={() => setViewMode('frequency')}
            className={`px-4 py-2 rounded ${viewMode === 'frequency' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Release Frequency
          </button>
          
          <div className="mx-2 border-r border-gray-300"></div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded border border-gray-300"
          >
            <option value="all">All Categories</option>
            <option value="programming">Programming Tools</option>
            <option value="creative-libraries">Creative Libraries</option>
            <option value="physical-computing">Physical Computing</option>
            <option value="audio-visual">Audio-Visual</option>
            <option value="data-visualization">Data Visualization</option>
            <option value="web">Web-Based Tools</option>
            <option value="other">Other</option>
          </select>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">Year range:</span>
            <select 
              value={yearRange[0]}
              onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
              className="px-2 py-1 rounded border border-gray-300 text-sm"
            >
              {Array.from({length: 36}, (_, i) => 1990 + i).map(year => (
                <option key={`start-${year}`} value={year}>{year}</option>
              ))}
            </select>
            <span>-</span>
            <select 
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
              className="px-2 py-1 rounded border border-gray-300 text-sm"
            >
              {Array.from({length: 36}, (_, i) => 1990 + i).map(year => (
                <option key={`end-${year}`} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="mx-2 border-r border-gray-300"></div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">Chart height:</span>
            <input
              type="range"
              min="300"
              max="1200"
              step="50"
              value={chartHeight}
              onChange={(e) => setChartHeight(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-xs text-gray-500 ml-1">{chartHeight}px</span>
            
            <div className="flex gap-1 ml-2">
              <button 
                onClick={() => setChartHeight(400)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Small
              </button>
              <button 
                onClick={() => setChartHeight(600)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Medium
              </button>
              <button 
                onClick={() => setChartHeight(900)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Large
              </button>
              <button 
                onClick={() => {
                  // Dynamically calculate height based on number of software items
                  const height = Math.max(400, Math.min(1200, selectedSoftware.length * 25 + 150));
                  setChartHeight(height);
                }}
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
              >
                Auto-fit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-9/12 pr-0 md:pr-4">
          <div 
            className="border rounded-lg p-4 bg-white shadow-sm overflow-hidden"
            style={{ height: `${chartHeight}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'timeline' ? (
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 60, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    name="Date" 
                    domain={['auto', 'auto']}
                    type="number"
                    tickFormatter={(unixTime) => new Date(unixTime).getFullYear()}
                    label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="software" 
                    name="Software" 
                    type="category"
                    allowDuplicatedCategory={false}
                    width={150}
                    tick={{ 
                      fontSize: 12,
                      width: 140,
                      textAnchor: 'end'
                    }}
                    tickMargin={5}
                    interval={0} // Show all ticks
                  />
                  <ZAxis range={[50, 50]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    payload={Object.entries(categories).map(([key, cat]) => ({
                      value: cat.name || key,
                      type: 'circle',
                      color: cat.color || '#7f7f7f'
                    }))}
                    verticalAlign="bottom"
                    height={36}
                  />
                  <Scatter 
                    name="Software Releases" 
                    data={filteredData} 
                    fill="#8884d8"
                  >
                    {filteredData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getSoftwareColor(entry.software)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : (
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 60, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    type="number"
                    domain={['auto', 'auto']}
                    tickFormatter={(unixTime) => new Date(unixTime).getFullYear()}
                    label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    dataKey={(entry) => {
                      const date = new Date(entry.timestamp);
                      return date.getMonth();
                    }}
                    tickFormatter={(month) => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return monthNames[month];
                    }}
                    label={{ value: 'Month', position: 'insideLeft', angle: -90 }}
                    width={60}
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                    interval={0} // Show all months
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    payload={Object.entries(categories).map(([key, cat]) => ({
                      value: cat.name || key,
                      type: 'circle',
                      color: cat.color || '#7f7f7f'
                    }))}
                    verticalAlign="bottom"
                    height={36}
                  />
                  <Scatter 
                    name="Software Releases" 
                    data={filteredData} 
                    fill="#8884d8"
                  >
                    {filteredData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getSoftwareColor(entry.software)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Category breakdown */}
          <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-bold mb-2">Category Breakdown</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categories).map(([category, categoryData]) => {
                const count = filteredData.filter(item => item.category === category).length;
                const displayName = categoryData.name || category;
                
                // Skip categories with no items
                if (count === 0) return null;
                
                // Get the color from category data
                
                return (
                  <div 
                    key={category} 
                    className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setCategoryFilter(category === categoryFilter ? 'all' : category);
                    }}
                  >
                    <div className="flex items-center">
                      <span 
                        className="inline-block w-3 h-3 mr-2 rounded-full" 
                        style={{ backgroundColor: categoryData.color || '#7f7f7f' }}
                      ></span>
                      <span className="text-sm">{displayName}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/12 mt-4 md:mt-0">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Filter Software</h3>
              <button 
                className="text-xs text-blue-500 underline"
                onClick={toggleAllSoftware}
              >
                {selectedSoftware.length === softwareList.length ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            
            {/* Category quick filters */}
            <div className="mb-3 flex flex-wrap gap-1">
              {Object.entries(categories).filter(([cat, _]) => cat !== 'other').map(([category, categoryData]) => (
                <button 
                  key={category}
                  onClick={() => selectByCategory(category)}
                  className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  {(categoryData.name || category).split(' ')[0]}
                </button>
              ))}
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {softwareList.map((software) => {
                // Get the category for this software
                const category = getCategoryForSoftware(software);
                
                return (
                  <div key={software} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`checkbox-${software}`}
                      checked={selectedSoftware.includes(software)}
                      onChange={() => toggleSoftware(software)}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`checkbox-${software}`}
                      className="flex items-center cursor-pointer"
                    >
                      <span 
                        className="inline-block w-3 h-3 mr-2 rounded-full" 
                        style={{ backgroundColor: getSoftwareColor(software) }}
                      ></span>
                      {software}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
            <h3 className="font-bold mb-2">Statistics</h3>
            <p className="text-sm mb-1">Total releases: {filteredData.length}</p>
            <p className="text-sm mb-1">Software platforms: {selectedSoftware.length}</p>
            <p className="text-sm mb-1">Date range: {filteredData.length > 0 ? 
              `${new Date(Math.min(...filteredData.map(d => d.timestamp))).getFullYear()} - ${new Date(Math.max(...filteredData.map(d => d.timestamp))).getFullYear()}` 
              : 'N/A'}</p>
            
            {/* Timeline insights */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <h4 className="font-semibold text-sm mb-1">Timeline Insights</h4>
              {filteredData.length > 0 ? (
                <>
                  <p className="text-xs text-gray-600 mb-1">
                    Most active year: {
                      (() => {
                        const yearCounts = {};
                        filteredData.forEach(item => {
                          const year = item.date.getFullYear();
                          yearCounts[year] = (yearCounts[year] || 0) + 1;
                        });
                        const mostActiveYear = Object.entries(yearCounts)
                          .sort((a, b) => b[1] - a[1])[0];
                        return `${mostActiveYear[0]} (${mostActiveYear[1]} releases)`;
                      })()
                    }
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Earliest software: {
                      (() => {
                        const earliest = [...filteredData].sort((a, b) => a.timestamp - b.timestamp)[0];
                        return `${earliest.software} (${new Date(earliest.timestamp).getFullYear()})`;
                      })()
                    }
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-600">No data to analyze</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* About modal */}
      {showAbout && <AboutContent />}
    </div>
  );
}

export default CreativeCodeTimeline;